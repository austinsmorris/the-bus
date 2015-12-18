'use strict';

/**
 * Returns the human in control of this machine.
 *
 * @param stage
 * @returns string
 */
module.exports = (stage) => {
  if (process.env['HIPCHAT_USER']) {
    return process.env['HIPCHAT_USER'];
  }

  const user = stage.exec('git config user.name', {silent: true}).stdout.trim();

  if (user) {
    return user;
  }

  return process.env['USER'];
};
