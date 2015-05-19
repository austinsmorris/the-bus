'use strict';

var getReleases = require('./get-releases');

module.exports = function(plan, config, remote) {
  remote.log('Checking for stale releases');
  var releases = getReleases(plan, config, remote);

  remote.log('Found ' + releases.length + ' releases');

  if (releases.length > config.keepReleases) {
    remote.log('Removing ' + (releases.length - config.keepReleases) + ' stale release(s)');

    releases = releases.slice(0, releases.length - config.keepReleases);
    releases = releases.map(function (item) {return plan.runtime.options.projectDir + '/releases/' + item;});

    remote.exec('rm -rf ' + releases.join(' '));
  }
};
