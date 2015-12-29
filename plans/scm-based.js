'use strict';

const argv = require('yargs').argv,
  createDeployment = require('./actions/create-deployment'),
  copyConfig = require('./actions/copy-config'),
  createSymlink = require('./actions/create-symlink'),
  cleanupOldReleases = require('./actions/cleanup-old-releases'),
  fs = require('fs'),
  hipchat = require('../util/hipchat-notification');

module.exports = (plan, config) => {
  if (argv.scmuser) {
    config.scmuser = argv.scmuser;
  }

  plan.remote('deploy-scm', (remote) => {
    // let's make sure we can connect first...
  });

  plan.local('deploy-scm', (local) => {
    var checkoutProject = () => {
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

    const chatNotification = new hipchat(config, local);
    chatNotification.start();

    const source = config.source.replace('{scmuser}', config.scmuser);

    if (argv.cache) {
      config.tmp = 'tmp/deploy';

      // see if there's a previous build. If so, see if it's current.
      try {
        const stats = fs.statSync(config.tmp);

        local.exec('cd ' + config.tmp + ' && git fetch origin', {silent: true}).stdout;

        const localRev = local.exec('cd ' + config.tmp + ' && git rev-parse HEAD', {silent: true}).stdout;
        const remoteRev = local.exec('cd ' + config.tmp + ' && git rev-parse origin/master', {silent: true}).stdout;

        if (localRev.trim() !== remoteRev.trim()) {
          local.exec('rm -rf ' + config.tmp);
          checkoutProject();
        }
      } catch (e) {
        checkoutProject();
      }
    } else {
      config.tmp = 'tmp/' + (new Date().getTime());
      checkoutProject();
    }

    copyConfig(config, local);

    const buildCmd = plan.runtime.options.buildCmd;

    local.log('Building project...');
    local.exec('cd ' + config.tmp + ' && ' + buildCmd, {silent: true});
  });

  plan.remote('deploy-scm', (remote) => {
    createDeployment(plan, config, remote);
  });

  plan.local('deploy-scm', (local) => {
    local.log('Transferring source code');
    var files = local.exec('find ' + config.tmp + '/dist/', {silent: true});
    local.transfer(files, config.deployTo + '/');
  });

  plan.remote('deploy-scm', (remote) => {
    remote.exec('chmod -R g+w ' + config.deployTo)
    // silly:
    remote.exec('cd ' + config.deployTo + ' && cp -R ' + config.tmp + '/dist/* .');
    remote.exec('cd ' + config.deployTo + ' && rm -rf tmp');

    createSymlink(remote, config.deployTo, plan.runtime.options.projectDir + '/current');
    cleanupOldReleases(plan, config, remote);
  });

  plan.local('deploy-scm', (local) => {
    // only cleanup if we're deploying a non-master branch or not using the cache
    if (argv.branch || !argv.cache) {
      local.log('Cleaning up tmp/');
      local.exec('rm -rf ' + config.tmp);
    }

    const chatNotification = new hipchat(config, local);
    chatNotification.finish();
  });
};
