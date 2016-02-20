module.exports.index = function(req, res) {
  if(req.session.username != undefined) {
    var username = req.session.username;
  }
  else {
    var username = "";
  }

  var javascripts = [
    "https://cdn.socket.io/socket.io-1.4.5.js",
    "https://fb.me/react-0.14.7.min.js",
    "https://fb.me/react-dom-0.14.7.js",
    "/js/components/Index/ChannelList/ChannelControls.js",
    "/js/components/Index/ChannelList/ChannelItem.js",
    "/js/components/Index/ChannelList/ChannelListApp.js",
    "/js/components/Index/App.js",
    "/js/index.js"
  ];

  res.render("index", {data: {javascripts: javascripts, username: username}});
};

module.exports.about = function(req, res) {
  res.render("about");
};