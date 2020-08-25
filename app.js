var fs = require("fs");
var path = require("path");
var stylus = require("stylus");
var bodyParser = require("body-parser");
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var mongoose = require("mongoose");
var express = require("express");
var app = module.exports = express();
var config = require("./config.json")[app.get("env")];
app.locals = config;
var http = require("http").Server(app);
http.listen(config.web.http.port, config.web.host);
var io;
if(config.web.https.enabled) {
  var https = require("https").Server({
    key: fs.readFileSync(config.web.https.certificate.key),
    cert: fs.readFileSync(config.web.https.certificate.cert)
  }, app);
  https.listen(config.web.https.port, config.web.host);
  io = require("socket.io")(https);
}
else {
  io = require("socket.io")(http);
}

// database connection
var Channel = require("./models/channel");
mongoose.connect("mongodb://" + config.mongodb.host + ":" + config.mongodb.port + "/" + config.mongodb.database, {user: config.mongodb.user, pass: config.mongodb.password}, function() {
  Channel.remove({}).exec();
});

if(app.get("env") === "production") {
  var compression = require("compression");
  var minify = require("express-minify");
  app.use(compression());
  app.use(minify({cache: __dirname + "/public/cache/"}));
}
else {
  var logger = require("morgan");
  app.use(logger("dev"));
  app.locals.pretty = true;
}

app.set("views", __dirname + "/views");
app.set("view engine", "pug");
app.use(stylus.middleware({src: __dirname + "/public", compile: function(str, path) {
  return stylus(str).set("filename", path);
}}));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//redirect to https if enabled
app.use(function(req, res, next) {
  if(!req.connection.encrypted && config.web.https.enabled) {
    res.writeHead(301, {"Location": "https://" + req.headers["host"] + req.url});
    res.end();
  }
  else {
    return next();
  }
});
//send HSTS header
app.use(function(req, res, next) {
  if(config.web.https.enabled && config.web.https.hsts) res.header("Strict-Transport-Security", "max-age=31536000; includeSubdomains");
  return next();
});

var sessionMiddleware = session({
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: config.session.secureCookie,
    maxAge: 31536000000,
    expires: new Date(Date.now() + 31536000000)
  }
});

app.use(sessionMiddleware);

//pass express session middleware to socket.io to access user session data
io.use(function(socket, next) { 
  sessionMiddleware(socket.request, socket.request.res, next);
});

//socket.io controllers
require("./controllers/index-socket")(io);
require("./controllers/create-socket")(io);
require("./controllers/join-socket")(io);
require("./controllers/channel-socket")(io);

//routes
var site = require("./controllers/site");
var channel = require("./controllers/channel");
app.all("/", site.index);
app.all("/policy", site.policy);
app.all("/create", channel.form);
app.all("/channel/:id", channel.join);
app.all("/channel/:id/kicked", channel.kicked);
app.all("/channel/:id/banned", channel.banned);

// serve client js statically
app.use("/js/socket.io", express.static(path.join(__dirname, "node_modules/socket.io-client/dist/")));

//handle 404
app.use(function(req, res) {
  res.status(400);
  res.render("404.pug", {title: "404: File Not Found"});
});

//handle 500
app.use(function(error, req, res) {
  console.log(error);
  res.status(500);
  res.render("500.pug", {title:"500: Internal Server Error", error: error});
});
