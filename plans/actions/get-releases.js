'use strict';

module.exports = function(plan, config, remote) {
  var releases = remote.exec('ls ' + plan.runtime.options.projectDir + '/releases', {silent: true});

  if (releases.code === 0) {
    releases = releases.stdout.trim().split('\n');
    return releases;
  }

  return [];
};
