var shortId = require("shortid");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  socketId: String,
  moderator: Boolean,
  ready: {type: Boolean, default: false}
});

userSchema.set("toObject", {virtuals: true});
userSchema.set("toJSON", {virtuals: true});
userSchema.virtual("id").get(function() {
  return this._id.toString();
});

module.exports = userSchema;