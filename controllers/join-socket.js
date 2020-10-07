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
    var errors = {
      database: false,
      notfound: false,
      username: false,
      password: false
    };

    var self = this;
    Channel.findOne({"id": data.channelId}, function(error, channel) {
      if(error) errors.database = true;
      if(!channel) errors.notfound = true;

      if(data.username.length === 0 || data.username.length > 60) {
        errors.username = true;
      }
      else if(!session.username) {
        session.username = data.username;
        session.save();
      }

      if(channel.bannedIPs.indexOf(self.socket.remoteAddress) > -1) {
        self.socket.redirect("/channel/" + channel.id + "/banned");
        return;
      }

      new Promise((resolve) => {
        if(channel.secured && session.loggedInId !== channel.id) {
          channel.comparePassword(data.password, function(error, match) {
            if(error) throw error;
            if(match) {
              session.loggedInId = channel.id;
              session.save();
            }
            else {
              errors.password = true;
            }

            resolve();
          });
        }
        else {
          resolve();
        }
      }).then(() => {
        for(const [, error] of Object.entries(errors)) {
          if(error) {
            self.socket.emit("errors", errors);
            return;
          }
        }
  
        self.socket.redirect("/channel/" + channel.id);
      });
    });
  }

  disconnect() {
    console.log(this.socket.client.id + " disconnected");
  }
}

module.exports = JoinSocketController;
