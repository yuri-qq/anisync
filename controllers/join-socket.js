"use strict";
var Channel = require("../models/channel");

function JoinSocketController(io) {
  if(!(this instanceof JoinSocketController)) return new JoinSocketController(io);

  this.io = io;
  this.io.of("/join").on("connection", (socket) => new Socket(socket));
}

class Socket {
  constructor(socket) {
    this.socket = socket;
    this.socket.redirect = function(url) {
      this.emit("redirect", url);
    }

    console.log(this.socket.client.id + " connected");

    this.socket.on("join", (data) => this.join(data));
    this.socket.on("disconnect", () => this.disconnect());
  }

  join(data) {
    var session = this.socket.request.session;
    var errors = {};
    Channel.findOne({"_id": data.id}, function(error, channel) {
      if(error) errors.database = true;
      if(!channel) errors.notfound = true;

      if(data.username > 60) {
        errors.username = true;
      }
      else if(!session.username) {
        session.username = data.username;
        session.save();
      }

      if(channel.bannedIPs.indexOf(this.socket.remoteAddress) > -1) {
        this.socket.redirect("/channel/" + channel.id + "/banned");
        return;
      }

      if(!channel.secured || session.loggedInId == channel.id || !channel.password) {
        this.socket.redirect("/channel/" + channel.id);
      }
      else {
        channel.comparePassword(data.password, function(error, match) {
          if(error) errors.password = true;
          if(match) {
            session.loggedInId = data.id;
            session.save();
            this.socket.redirect("/channel/" + channel.id);
          }
        });
      }
    });
  }

  disconnect() {
    console.log(this.socket.client.id + " disconnected");
  }
}

module.exports = JoinSocketController;
