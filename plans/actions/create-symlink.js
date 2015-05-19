'use strict';

module.exports = function(remote, source, name) {
  remote.log('Linking ' + name + ' to ' + source);
  remote.exec('ln -nfs ' + source + ' ' + name);
};
