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
