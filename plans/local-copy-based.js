'use strict';

var createDeployment = require('./actions/create-deployment');
var copyConfig = require('./actions/copy-config');
var createSymlink = require('./actions/create-symlink');
var cleanupOldReleases = require('./actions/cleanup-old-releases');
// var hipchat = require('../util/hipchat-notification');

module.exports = function(plan, config) {
  plan.local('deploy-local', function (local) {
    if (local._context.target == 'production') {
      plan.abort('local deployments to production are forbidden');
    }

    // var chatNotification = new hipchat(local);
    // chatNotification.start(true);

    var buildCmd = plan.runtime.options.buildCmd;

    local.log('Building project...');
    local.exec('cd ' + config.tmp + ' && ' + buildCmd, {silent: true});

    config.tmp = ".";
    local.exec('cp ./src/config.js ./src/config.js.tmp');
    copyConfig(local);
  });

  plan.remote('deploy-local', function (remote) {
    createDeployment(remote);
  });

  plan.local('deploy-local', function (local) {
    local.log('Transferring source code');
    var files = local.exec('find ' + config.tmp + '/dist/', {silent: true});
    local.transfer(files, config.deployTo + '/');
  });

  plan.remote('deploy-local', function (remote) {
    // silly:
    remote.exec('cd ' + config.deployTo + ' && cp -R dist/* .');
    remote.exec('cd ' + config.deployTo + ' && rm -rf dist');

    createSymlink(remote, config.deployTo, config.projectDir + '/current');
    cleanupOldReleases(remote);
  });

  plan.local('deploy-local', function (local) {
    local.exec('mv ./src/config.js.tmp ./src/config.js');

    // var chatNotification = new hipchat(local);
    // chatNotification.finish(true);
  });
};
