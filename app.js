var fs = require("fs");
var path = require("path");
var stylus = require("stylus");
var bodyParser = require("body-parser");
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var mongoose = require("mongoose");
var compression = require("compression");
var minify = require("express-minify");
var express = require("express");
var app = module.exports = express();
const CONFIG = require("./config.json")[app.get("env")];
var http = require("http");
var https = require("https").Server({
  key: fs.readFileSync(CONFIG.certificate.key),
  cert: fs.readFileSync(CONFIG.certificate.cert)
}, app);
var io = require("socket.io")(https);

// database connection
mongoose.connect("mongodb://" + CONFIG.mongodb.host + ":" + CONFIG.mongodb.port + "/" + CONFIG.mongodb.database, {user: CONFIG.mongodb.user, pass: CONFIG.mongodb.password}, function() {
  mongoose.connection.db.dropDatabase(); //delete database with temp data
});

if(app.get("env") == "production") {
  app.use(compression());
  app.use(minify({cache: __dirname + "/public/cache/"}));
}
else {
  var logger = require("morgan");
  app.use(logger("dev"));
  app.locals.pretty = true;
}

app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(stylus.middleware({src: __dirname + "/public", compile: function(str, path) {
  return stylus(str).set("filename", path);
}}));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function(req, res, next) {
  res.header("Strict-Transport-Security", "max-age=31536000; includeSubdomains");
  return next();
});

var sessionMiddleware = session({
  store: new RedisStore({host: CONFIG.redis.host, port: CONFIG.redis.port}),
  secret: CONFIG.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: 31536000000,
    expires: new Date(Date.now() + 31536000000)
  }
});

app.use(sessionMiddleware);

//routes
site = require("./controllers/site");
channel = require("./controllers/channel");
app.all("/", site.index);
app.all("/policy", site.policy);
app.get("/create", channel.form);
app.post("/create", channel.create);
app.all("/channel/:id", channel.join);
app.all("/channel/:id/kicked", channel.kicked);
app.all("/channel/:id/banned", channel.banned);

//handle 404
app.use(function(req, res) {
  res.status(400);
  res.render("404.jade", {title: "404: File Not Found"});
});

//handle 500
app.use(function(error, req, res, next){
  console.log(error);
  res.status(500);
  res.render("500.jade", {title:"500: Internal Server Error", error: error});
});

//start server
https.listen(CONFIG.web.httpsPort, CONFIG.web.host, function() {
  console.log("Server listening on https://%s:%s", https.address().address, https.address().port);
});

//redirect all unencrypted traffic
http.createServer(function (req, res) {
  res.writeHead(301, {"Location": "https://" + req.headers["host"] + req.url});
  res.end();
}).listen(CONFIG.web.httpPort, CONFIG.web.host);

//pass express session middleware to socket.io to access user session data
io.use(function(socket, next) { 
  sessionMiddleware(socket.request, socket.request.res, next);
});

var indexSocket = require("./controllers/index-socket")(io);
var channelSocket = require("./controllers/channel-socket")(io);
