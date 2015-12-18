'use strict';

module.exports = (plan, config, remote) => {
  let releases = remote.exec('ls ' + plan.runtime.options.projectDir + '/releases', {silent: true});

  if (releases.code === 0) {
    releases = releases.stdout.trim().split('\n');
    return releases;
  }

  return [];
};
