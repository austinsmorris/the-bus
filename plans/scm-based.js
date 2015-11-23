'use strict';

var argv = require('yargs').argv;
var createDeployment = require('./actions/create-deployment');
var copyConfig = require('./actions/copy-config');
var createSymlink = require('./actions/create-symlink');
var cleanupOldReleases = require('./actions/cleanup-old-releases');
var fs = require('fs');

// var hipchat = require('../util/hipchat-notification');

module.exports = function(plan, config) {
  if (argv.scmuser) {
    config.scmuser = argv.scmuser;
  }

  plan.remote('deploy-scm', function (remote) {
    // let's make sure we can connect first...
  });

  plan.local('deploy-scm', function (local) {
    var checkoutProject = function () {
      local.log('Checking out source code with branch [master]...');
      local.exec('mkdir -p ' + config.tmp);

      if (argv.branch) {
        local.exec('git clone ' + source + ' ' + config.tmp, {silent: true});
        local.exec('cd ' + config.tmp + ' && git checkout ' + argv.branch);
      } else {
        local.exec('git clone --depth=1 ' + source + ' ' + config.tmp, {silent: true});
      }

      local.log('Installing dependencies...');
      local.exec('cd ' + config.tmp + ' && npm i', {silent: true});
    };

    // var chatNotification = new hipchat(config, local);
    // chatNotification.start();

    var source = config.source.replace('{scmuser}', config.scmuser);

    config.tmp = 'tmp/deploy'; //' + (new Date().getTime());

    // see if there's a previous build. If not, see if it's current.
    try {
      var stats = fs.statSync(config.tmp);
      var localRev = local.exec('cd ' + config.tmp + ' && git rev-parse HEAD', {silent: true}).stdout;
      var remoteRev = local.exec('cd ' + config.tmp + ' && git rev-parse origin/master', {silent: true}).stdout;

      if (localRev !== remoteRev) {
        local.exec('rm -rf ' + config.tmp);
        checkoutProject();
      }
    } catch (e) {
      checkoutProject();
    }

    copyConfig(config, local);

    var buildCmd = plan.runtime.options.buildCmd;

    local.log('Building project...');
    local.exec('cd ' + config.tmp + ' && ' + buildCmd, {silent: true});
  });

  plan.remote('deploy-scm', function (remote) {
    createDeployment(plan, config, remote);
  });

  plan.local('deploy-scm', function (local) {
    local.log('Transferring source code');
    var files = local.exec('find ' + config.tmp + '/dist/', {silent: true});
    local.transfer(files, config.deployTo + '/');
  });

  plan.remote('deploy-scm',function (remote) {
    remote.exec('chmod -R g+w ' + config.deployTo)
    // silly:
    remote.exec('cd ' + config.deployTo + ' && cp -R ' + config.tmp + '/dist/* .');
    remote.exec('cd ' + config.deployTo + ' && rm -rf tmp');

    createSymlink(remote, config.deployTo, plan.runtime.options.projectDir + '/current');
    cleanupOldReleases(plan, config, remote);
  });

  plan.local('deploy-scm', function (local) {
    // only cleanup if we're deploying a non-master branch
    if (argv.branch) {
      local.log('Cleaning up tmp/');
      local.exec('rm -rf ' + config.tmp);
    }

    // var chatNotification = new hipchat(config, local);
    // chatNotification.finish();
  });
};
