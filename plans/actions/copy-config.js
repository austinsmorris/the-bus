'use strict';

module.exports = function(config, server) {
  var configFile = null;

  switch (server._context.target) {
    case 'staging':
      configFile = 'config/config-staging.js';
      break;
    case 'production':
      configFile = 'config/config-production.js';
      break;
  }

  if (configFile) {
    server.exec('cd ' + config.tmp + ' && cp ' + configFile + ' src/config.js');
  }
};
