var Channel = require('../models/channel');

module.exports.form = function(req, res) {
  res.render("create", {username: req.session.username ? true : false});
};

module.exports.create = function(req, res, next) {
  if(!req.session.username) req.session.username = req.body.username;
  var private = req.body.private == 'on' ? true : false;
  
  var errors = {};
  if(!req.session.username) errors.username = true;
  if(!req.body.channelname) errors.channelname = true;
  if(private && !req.body.password) errors.password = true;

  if(Object.keys(errors).length) {
    res.render("create", {username: req.session.username ? true : false, private: private, password: req.body.password, errors: errors});
    return;
  }

  var data = {
    name: req.body.channelname,
    playing: false,
    private: private,
    users: [],
    playlist: []
  };

  if(private) data.password = req.body.password;

  var newChannel = Channel(data);

  newChannel.save(function(error, channel) {
    if(error) return next(error);
    if(!data) return next(new Error("No channel found"));

    req.session.loggedInId = channel.id;
    res.redirect('/channel/' + channel.id);
  });
};

module.exports.join = function(req, res, next) {
  Channel.findOne({"_id": req.params.id}, function(error, data) {
    if(error) return next(error);
    if(!data) return next(new Error("No channels found"));

    var errors = {};

    if(!req.session.username) req.session.username = req.body.username;

    if(!data.private || req.session.loggedInId == req.params.id || !req.body.password) {
      renderView();
    }
    else {
      data.comparePassword(req.body.password, function(error, match) {
        if(match) {
          req.session.loggedInId = req.params.id;
        }
        else {
          errors.password = true;
        }
        renderView();
      });
    }

    function renderView() {
      if(req.session.username && (req.session.loggedInId == req.params.id || !data.private)) {
        res.render("channel", {data: {name: data.name}});
      }
      else {
        res.render("join", {private: data.private, username: req.session.username ? true : false, errors: errors});
      }
    }

  });
};