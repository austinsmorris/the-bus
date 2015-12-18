'use strict';

const requireDir = require('require-dir');

module.exports = (flightplan, config) => {
  const plans = requireDir('./plans/');

  for (const plan in plans) {
    plans[plan](flightplan, config);
  }
};
