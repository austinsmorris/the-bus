'use strict';

var requireDir = require('require-dir');

module.exports = function (flightplan, config) {
  var plans = requireDir('./plans/');

  for (var plan in plans) {
    plans[plan](flightplan, config);
  }
};
