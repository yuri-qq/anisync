// This file is part of anisync.
// Copyright (C) 2020 Jannes Grzebien
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

var Channel = require('../models/channel');

module.exports.form = function(req, res) {
  res.render("create", {init: {
    load: "create",
    username: req.session.username ? req.session.username : ""
  }});
};

function getChannel(id, next, callback) {
  Channel.findOne({"id": id}, function(error, channel) {
    if(error) return next(error);
    if(!channel) return next();
    callback(channel);
  });
}

module.exports.join = function(req, res, next) {
  getChannel(req.params.id, next, function(channel) {
    if(channel.bannedIPs.indexOf(req.ip) > -1) {
      res.render("banned", {text: "banned", channelname: channel.name});
    }
    else if(req.session.username && (req.session.loggedInId === req.params.id || !channel.secured)) {
      res.render("channel", {init: {
        load: "channel",
        name: channel.name,
        channelId: channel.id
      }});
    }
    else {
      res.render("join", {init: {
        load: "join",
        secured: channel.secured,
        username: req.session.username ? true : false,
        channelId: channel.id
      }});
    }
  });
};

module.exports.kicked = function(req, res, next) {
  getChannel(req.params.id, next, function(channel) {
    res.render("banned", {text: "kicked", channelname: channel.name});
  });
};

module.exports.banned = function(req, res, next) {
  getChannel(req.params.id, next, function(channel) {
    res.render("banned", {text: "banned", channelname: channel.name});
  });
};
