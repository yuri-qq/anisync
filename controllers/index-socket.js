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

"use strict";
var Channel = require("../models/channel");

function IndexSocketController(io) {
  if(!(this instanceof IndexSocketController)) return new IndexSocketController(io);

  this.io = io;
  this.io.of("/index").on("connection", (socket) => new Socket(socket));
}

class Socket {
  constructor(socket) {
    this.socket = socket;

    console.log(this.socket.client.id + " connected");

    this.socket.on("setUsername", (username) => this.setUsername(username));
    this.socket.on("disconnect", () => this.disconnect());

    //find non empty channels
    Channel.find({users: {$exists: true, $ne: []}}, (error, channels) => this.setChannels(error, channels));
  }

  setUsername(username) {
    if(username.length > 60 || username.length === 0) {
      this.socket.emit("errors", {username: true});
      return;
    }
    
    this.socket.request.session.username = username;
    this.socket.request.session.save();
  }

  setChannels(error, channels) {
    channels.forEach(function(channel, index) {
      channels[index] = channel.toIndex();
    });

    this.socket.emit("setChannels", channels);
  }

  disconnect() {
    console.log(this.socket.client.id +  " disconnected");
  }
}

module.exports = IndexSocketController;
