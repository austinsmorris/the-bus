'use strict';

const getReleases = require('./get-releases');

module.exports = (plan, config, remote) => {
  remote.log('Checking for stale releases');
  let releases = getReleases(plan, config, remote);

  remote.log('Found ' + releases.length + ' releases');

  if (releases.length > config.keepReleases) {
    remote.log('Removing ' + (releases.length - config.keepReleases) + ' stale release(s)');

    releases = releases.slice(0, releases.length - config.keepReleases);
    releases = releases.map((item) => {return plan.runtime.options.projectDir + '/releases/' + item;});

    remote.exec('rm -rf ' + releases.join(' '));
  }
};
