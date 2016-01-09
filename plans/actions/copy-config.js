'use strict';

module.exports = (config, server) => {
  let configFile = null;

  switch (server._context.target) {
    case 'december':
      configFile = 'config/config-december.js';
      break;
    case 'demo':
      configFile = 'config/config-demo.js';
      break;
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
