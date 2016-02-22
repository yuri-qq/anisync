var Channel = require('../models/channel');

module.exports.form = function(req, res) {
  res.render("create");
};

module.exports.create = function(req, res) {
  var private = req.body.private == 'on' ? true : false;

  var data = {
    name: req.body.name,
    playing: false,
    private: private,
    users: [],
    playlist: []
  };

  if(private) data.password = req.body.password;

  var newChannel = Channel(data);

  newChannel.save(function(error, channel) {
    if(error) return;

    req.session.loggedInId = channel.id;
    res.redirect('/channel/' + channel.id);
  });
};

module.exports.join = function(req, res, next) {
  Channel.findOne({"_id": req.params.id}, function(error, data) {
    if(error) return next(error);

    if(!data) return next();

    var errors = [];

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
          errors.push("wrongPassword");
        }
        renderView();
      });
    }

    function renderView() {
      if(req.session.username && (req.session.loggedInId == req.params.id || !data.private)) {
        res.render("channel", {data: {name: data.name}});
      }
      else {
        res.render("join", {data: {private: data.private, username: req.session.username ? true : false, errors: errors}});
      }
    }

  });
};