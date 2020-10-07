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
        username: req.session.username ? true : false
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
