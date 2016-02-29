var shortId = require("shortid");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var playlistItemSchema = new Schema({
  url: String,
  webpage: String,
  title: String
});

playlistItemSchema.set("toObject", {virtuals: true});
playlistItemSchema.set("toJSON", {virtuals: true});
playlistItemSchema.virtual("id").get(function() {
  return this._id.toString();
});

module.exports = playlistItemSchema;