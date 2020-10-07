var shortId = require("shortid");
var bcrypt = require("bcrypt");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = require("./schemas/user");
var playlistItemSchema = require("./schemas/playlistItem");

var channelSchema = new Schema({
  id: {
    type: String,
    unique: true,
    default: shortId.generate
  },
  name: String,
  playing: Boolean,
  secured: Boolean,
  password: String,
  users: [userSchema],
  playlist: [playlistItemSchema],
  repeat: Boolean,
  bannedIPs: [String],
  createdAt: {
    type: Date,
    expires: 10,
    default: Date.now
  } //expire after 10 seconds (if no user joins)
});

channelSchema.set("toObject", {virtuals: true});
channelSchema.set("toJSON", {virtuals: true});

channelSchema.pre("save", function(next) {
  var channel = this;

  if(!channel.isModified("password")) return next();

  bcrypt.genSalt(10, function(error, salt) {
    if(error) return next(error);
    bcrypt.hash(channel.password, salt, function(error, hash) {
      if(error) return next(error);
      channel.password = hash;
      next();
    });
  });
});

channelSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(error, match) {
    if(error) return callback(error);
    callback(null, match);
  });
};

channelSchema.methods.toIndex = function() {
  var channel = {
    id: this.id,
    name: this.name,
    secured: this.secured,
    usercount: this.users.length
  };

  return channel;
};

var Channel = mongoose.model("channel", channelSchema);
module.exports = Channel;
