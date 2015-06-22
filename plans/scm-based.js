'use strict';

var createDeployment = require('./actions/create-deployment');
var copyConfig = require('./actions/copy-config');
var createSymlink = require('./actions/create-symlink');
var cleanupOldReleases = require('./actions/cleanup-old-releases');
var hipchat = require('../util/hipchat-notification');

module.exports = function(plan, config) {
  plan.remote('deploy-scm', function (remote) {
    // let's make sure we can connect first...
  });

  plan.local('deploy-scm', function (local) {
    var chatNotification = new hipchat(config, local);
    chatNotification.start();

    var source = config.source.replace('{scmuser}', config.scmuser);

    config.tmp = 'tmp/' + (new Date().getTime());

    local.log('Checking out source code with branch [master]...');
    local.exec('mkdir -p ' + config.tmp);
    local.exec('git clone --depth=1 ' + source + ' ' + config.tmp, {silent: true});

    copyConfig(config, local);

    local.log('Installing dependencies...');
    local.exec('cd ' + config.tmp + ' && npm i', {silent: true});

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
    local.log('Cleaning up tmp/');
    local.exec('rm -rf ' + config.tmp);

    var chatNotification = new hipchat(config, local);
    chatNotification.finish();
  });
};
