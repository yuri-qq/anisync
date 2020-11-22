// This file is part of anisync.
// Copyright (C) 2020 Jannes Grzebien
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  socketId: String,
  moderator: {type: Boolean, default: false},
  ready: {type: Boolean, default: false},
  ended: {type: Boolean, default: false}
});

userSchema.set("toObject", {virtuals: true});
userSchema.set("toJSON", {virtuals: true});
userSchema.virtual("id").get(function() {
  return this._id.toString();
});

module.exports = userSchema;
