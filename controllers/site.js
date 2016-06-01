module.exports.index = function(req, res) {
  res.render("index", {init: {
    load: "index",
    username: req.session.username ? req.session.username : ""
  }});
};

module.exports.policy = function(req, res) {
  res.render("policy");
};
