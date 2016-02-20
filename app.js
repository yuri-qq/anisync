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
var app = express();
var config = require("./config.json")[app.get("env")];
var http = require("http");
var https = require("https").Server({
  key: fs.readFileSync(config.certificate.key),
  cert: fs.readFileSync(config.certificate.cert)
}, app);
var io = require("socket.io")(https);

// database connection
mongoose.connect("mongodb://" + config.mongodb.host + ":" + config.mongodb.port + "/" + config.mongodb.database, {user: config.mongodb.user, pass: config.mongodb.password}, function() {
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
  store: new RedisStore({host: config.redis.host, port: config.redis.port}),
  secret: config.sessionSecret,
  resave: true,
  saveUninitialized: true
});

app.use(sessionMiddleware);

//routes
site = require("./controllers/site");
channel = require("./controllers/channel");
app.all("/", site.index);
app.all("/about", site.about);
app.get("/create", channel.form);
app.post("/create", channel.create);
app.all("/channel/:id", channel.join);

//handle 404
app.use(function(req, res) {
  res.status(400);
  res.render("404.jade", {title: "404: File Not Found"});
});

//handle 500
app.use(function(error, req, res, next){
  res.status(500);
  res.render("500.jade", {title:"500: Internal Server Error", error: error});
});

//start server
https.listen(config.web.httpsPort, config.web.host, function() {
  console.log("Server listening on https://%s:%s", https.address().address, https.address().port);
});

//redirect all unencrypted traffic
http.createServer(function (req, res) {
  res.writeHead(301, {"Location": "https://" + req.headers["host"] + req.url});
  res.end();
}).listen(config.web.httpPort, config.web.host);

//pass express session middleware to socket.io to access user session data
io.use(function(socket, next) { 
  sessionMiddleware(socket.request, socket.request.res, next);
});

index_socket = require("./controllers/index-socket")(io);
channel_socket = require("./controllers/channel-socket")(io, config);