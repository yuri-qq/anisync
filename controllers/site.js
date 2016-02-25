module.exports.index = function(req, res) {
  if(req.session.username != undefined) {
    var username = req.session.username;
  }
  else {
    var username = "";
  }

  res.render("index", {data: {username: username}});
};

module.exports.policy = function(req, res) {
  res.render("policy");
};