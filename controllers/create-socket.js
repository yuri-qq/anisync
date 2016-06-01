"use strict";
var Channel = require("../models/channel");

function CreateSocketController(io) {
  if(!(this instanceof CreateSocketController)) return new CreateSocketController(io);

  this.io = io;
  this.io.of("/create").on("connection", (socket) => new Socket(socket));
}

class Socket {
  constructor(socket) {
    this.socket = socket;
    this.socket.redirect = function(url) {
      this.emit("redirect", url);
    }

    console.log(this.socket.client.id + " connected");

    this.socket.on("create", (data) => this.create(data));
    this.socket.on("disconnect", () => this.disconnect());
  }

  create(data) {
    var session = this.socket.request.session;
    var errors = {};

    if(session.username !== data.username) {
      session.username = data.username;
      session.save();
    }

    if(!session.username || session.username.length > 60) errors.username = true;
    if(!data.channelname || data.channelname.length > 150) errors.channelname = true;
    if(data.secured && !data.password) errors.password = true;

    if(Object.keys(errors).length > 0) {
      this.socket.emit("errors", errors);
      return;
    }

    var channeldata = {
      name: data.channelname,
      playing: false,
      secured: data.secured,
      users: [],
      playlist: [],
      repeat: true
    };

    if(channeldata.secured) channeldata.password = data.password;

    var self = this;
    var newChannel = Channel(channeldata);
    newChannel.save(function(error, channel) {
      if(error || !channel) {
        errors.other = {message: "There appears to be an error with the database."};
        self.socket.emit("errors", errors);
        return;
      }
      
      session.loggedInId = channel.id;
      session.save();
      self.socket.redirect("/channel/" + channel.id);
    });
  }

  disconnect() {
    console.log(this.socket.client.id + " disconnected");
  }
}

module.exports = CreateSocketController;
