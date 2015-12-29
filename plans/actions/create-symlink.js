'use strict';

module.exports = (remote, source, name) => {
  remote.log('Linking ' + name + ' to ' + source);
  remote.exec('ln -nfs ' + source + ' ' + name);
};
