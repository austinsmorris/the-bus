'use strict';

const hipchatter = require('hipchatter'),
  human = require('./human'),
  _ = require('lodash');

const chat = new hipchatter();

let HipChatNotifier = function (config, stage) {
  this.config = config;
  this.stage = stage._context.target;
  this.human = human(stage);
  this.rooms = config.hipchat ? (config.hipchat.rooms[this.stage] ? config.hipchat.rooms[this.stage] : {}) : {};
};

HipChatNotifier.prototype.start = (isLocal) => {
  var that = this;
  _.forEach(this.rooms, (key, room) => {
    chat.notify(
      room,
      {
        message: that.human + ' is deploying ' + ((isLocal) ? 'a local copy of ' : '') + that.config.product + ' to ' + that.stage,
        color: 'yellow',
        token: key
      },
      () => {}
    );
  });
};

HipChatNotifier.prototype.finish = (isLocal) => {
  var that = this;
  _.forEach(this.rooms, (token, room) => {
    chat.notify(
      room,
      {
        message: that.human + ' finished deploying ' + ((isLocal) ? 'a local copy of ' : '') + that.config.product + ' to ' + that.stage,
        color: 'green',
        token: token
      },
      () => {}
    );
  });
};

module.exports = HipChatNotifier;
