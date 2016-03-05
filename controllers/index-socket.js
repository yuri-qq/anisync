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