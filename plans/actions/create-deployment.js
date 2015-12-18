'use strict';

module.exports = (plan, config, remote) => {
  config.deployTo = plan.runtime.options.projectDir + '/releases/' + (new Date().getTime());
  remote.log('Creating webroot: ' + config.deployTo);
  remote.exec('mkdir -p ' + config.deployTo);
};
