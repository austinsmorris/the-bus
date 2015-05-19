'use strict';

var hipchatter = require('hipchatter');
var human = require('./human');
var _ = require('lodash');

var chat = new hipchatter();

var HipChatNotifier = function (config, stage) {
  this.config = config;
  this.stage = stage._context.target;
  this.human = human(stage);
  this.rooms = config.hipchat ? (config.hipchat.rooms[this.stage] ? config.hipchat.rooms[this.stage] : {}) : {};
};

HipChatNotifier.prototype.start = function (isLocal) {
  var that = this;
  _.forEach(this.rooms, function (key, room) {
    chat.notify(
      room,
      {
        message: that.human + ' is deploying ' + ((isLocal) ? 'a local copy of ' : '') + that.config.product + ' to ' + that.stage,
        color: 'yellow',
        token: key
      },
      function () {}
    );
  });
};

HipChatNotifier.prototype.finish = function (isLocal) {
  var that = this;
  _.forEach(this.rooms, function (token, room) {
    chat.notify(
      room,
      {
        message: that.human + ' finished deploying ' + ((isLocal) ? 'a local copy of ' : '') + that.config.product + ' to ' + that.stage,
        color: 'green',
        token: token
      },
      function () {}
    );
  });
};

module.exports = HipChatNotifier;
