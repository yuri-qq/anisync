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

var playlistItemSchema = new Schema({
    formats: Array,
    webpage: String,
    title: String
});

playlistItemSchema.set("toObject", {virtuals: true});
playlistItemSchema.set("toJSON", {virtuals: true});

module.exports = playlistItemSchema;
