var Channel = require('../models/channel');

module.exports.form = function(req, res) {
  res.render("create", {data: {javascripts: ["/js/create.js"]}});
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
        var javascripts = [
          "https://cdn.socket.io/socket.io-1.4.5.js",
          "https://fb.me/react-0.14.7.min.js",
          "https://fb.me/react-dom-0.14.7.js",
          "/js/lib/video.js",
          "//cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js",
          "/js/lib/react-sortable-mixin.js",
          "/js/components/Channel/Video/VideoApp.js",
          "/js/components/Channel/Playlist/PlaylistControls.js",
          "/js/components/Channel/Playlist/PlaylistItem.js",
          "/js/components/Channel/Playlist/Playlist.js",
          "/js/components/Channel/Playlist/PlaylistApp.js",
          "/js/components/Channel/Chat/ChatControls.js",
          "/js/components/Channel/Chat/ChatMessage.js",
          "/js/components/Channel/Chat/ChatApp.js",
          "/js/components/Channel/Users/UserItem.js",
          "/js/components/Channel/Users/UserApp.js",
          "/js/components/Channel/App.js",
          "/js/channel.js"
        ];
        res.render("channel", {data: {javascripts: javascripts, name: data.name}});
      }
      else {
        res.render("join", {data: {private: data.private, username: req.session.username ? true : false, errors: errors}});
      }
    }

  });
};