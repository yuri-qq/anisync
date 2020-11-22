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
  Channel.findOne({"id": id}, function(error, data) {
    if(error) return next(error);
    if(!data) return next();
    callback(data);
  });
}

module.exports.join = function(req, res, next) {
  getChannel(req.params.id, next, function(data) {
    if(req.session.username && (req.session.loggedInId === req.params.id || !data.secured)) {
      res.render("channel", {init: {
        load: "channel",
        name: data.name,
        channelId: data.id
      }});
    }
    else {
      res.render("join", {init: {
        load: "join",
        secured: data.secured,
        username: req.session.username ? true : false,
        channelId: data.id
      }});
    }
  });
};

module.exports.kicked = function(req, res, next) {
  getChannel(req.params.id, next, function(data) {
    res.render("banned", {text: "kicked", channelname: data.name});
  });
};

module.exports.banned = function(req, res, next) {
  getChannel(req.params.id, next, function(data) {
    res.render("banned", {text: "banned", channelname: data.name});
  });
};
