"use strict";
var Channel = require("../models/channel");
var YoutubeDL = require("../util/YoutubeDL");
var linkify = require("linkify-it")();
linkify.tlds(require("tlds")); 

function ChannelSocketController(io) {
  if(!(this instanceof ChannelSocketController)) return new ChannelSocketController(io);

  io.of("/channels").on("connection", (socket) => new Socket(io, socket));
}


class Socket {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    this.socket.on("join", (id) => {
      this.id = id;
      this.socket.on("getTime", () => this.getTime());
      this.socket.on("pushTime", (data) => this.pushTime(data));
      this.socket.on("ready", () => this.ready());
      this.socket.on("play", (time) => this.play(time));
      this.socket.on("pause", (time) => this.pause(time));
      this.socket.on("seeked", (time) => this.seeked(time));
      this.socket.on("addItems", (data) => this.addItems(data));
      this.socket.on("removeItem", (data) => this.removeItem(data));
      this.socket.on("moveItem", (data) => this.moveItem(data));
      this.socket.on("refreshItem", (id) => this.refreshItem(id));
      this.socket.on("playItem", (index) => this.playItem(index));
      this.socket.on("loadPlaylist", (items) => this.loadPlaylist(items)); 
      this.socket.on("chatMessage", (text) => this.chatMessage(text));
      this.socket.on("updateUser", (data) => this.updateUser(data));
      this.socket.on("moderatorUpdate", (data) => this.moderatorUpdate(data));
      this.socket.on("disconnect", () => this.disconnect());
      this.join(id);
    });
  }

  join(id) {
    var self = this;
    Channel.findOne({_id: this.id}, function(error, data) {
      if(error) throw error;
      if(!data) return;

      if(!data.private || self.socket.request.session.loggedInId == self.id) {

        self.socket.join(self.id);
        console.log(self.socket.client.id + " joined " + id);

        //assume first user who joins is channel creator
        var user = {
          socketId: self.socket.client.id,
          username: self.socket.request.session.username,
          moderator: data.users.length ? false : true
        };
        self.io.of("/channels").to(self.id).emit("connected", user);

        //remove expiration time of channel
        Channel.findOneAndUpdate({_id: self.id}, {$push: {users: user}, $set: {createdAt: null}}, {upsert: true, new: true}, function(error, data) {
          if(error) throw error;

          self.socket.emit("setup", data);

          if(data.users.length == 1) {
            var channel = data.toIndex();
            self.io.of("/index").emit("addChannel", channel);
            return;
          }
          self.io.of("/index").emit("incrementUsercount", self.id);
        });
      }
    });
  }

  getTime() {
    this.socket.to(this.id).emit("requestTime");
  }

  pushTime(data) {
    this.socket.to(this.id).emit("pushTime", data);
  }

    //if all users in a channel have loaded metadata of selected video, start playing it
  ready() {
    var self = this;
    Channel.findOneAndUpdate({"users.socketId": this.socket.client.id}, {$set: {"users.$.ready": true}}, {new: true}, function(error, data) {
      if(error) throw error;

      var ready = 0;
      for(var i = 0; i < data.users.length; i++) {
        if(data.users[i].ready) {
          ready++;
        }
      }

      if(ready == data.users.length) {
        for(var i = 0; i < data.users.length; i++) {
          Channel.update({"users.socketId": data.users[i].socketId}, {$set: {"users.$.ready": false}}).exec();
        }

        
        /*  
          start synced playback, assume clients are at 0:00 
          and don't set it explicitly before playing to not reset the player's ready state
          which would cause the playing video to stay at 0:00 (tested in Firefox)
        */
        self.io.of("/channels").to(self.id).emit("play");

        Channel.update({_id: self.id}, {playing: true}).exec();
      }
    });
  }

  play(time) {
    var self = this;
    this.isModerator(function() {
      Channel.update({_id: self.id}, {playing: true}).exec();
      self.socket.to(self.id).emit("play", time);
    });
  }

  pause(time) {
    var self = this;
    this.isModerator(function() {
      Channel.update({_id: self.id}, {playing: false}).exec();
      self.socket.to(self.id).emit("pause", time);
    });
  }

  seeked(time) {
    var self = this;
    this.isModerator(function() {
      this.socket.to(self.id).emit("seeked", time);
    });
  }

  addItems(data) {
    var self = this;
    this.isModerator(function() {
      YoutubeDL.getMedia(data.url, data.addPlaylist, function(error, files) {
        if(error) {
          self.socket.emit("addItems", {error: error});
          return;
        }

        Channel.findOneAndUpdate({_id: self.id}, {$push: {playlist: {$each: files}}}, {upsert: true, new: true}, function(error, data) {
          if(error) throw error;

          for(var i = 0; i < files.length; i++) {
            files[i].id = data.playlist[data.playlist.length - files.length + i].id;
          }
          self.io.of("/channels").to(self.id).emit("addItems", files);
        });
      });
    });
  }

  removeItem(data) {
    var self = this;
    this.isModerator(function() {
      Channel.update({_id: self.id}, {$pull: {playlist: {_id: data.id}}}).exec();
      self.socket.to(self.id).emit("removeItem", data.index);
    });
  }

  moveItem(data) {
    var self = this;
    this.isModerator(function() {
      Channel.findOne({_id: self.id}, function(error, channelObject) {
        if(error) throw error;

        channelObject.playlist.splice(data.newIndex, 0, channelObject.playlist.splice(data.oldIndex, 1)[0]);
        Channel.update({_id: self.id}, {$set: {playlist: channelObject.playlist}}).exec();
      });
      self.socket.to(self.id).emit("moveItem", {oldIndex: data.oldIndex, newIndex: data.newIndex});
    });
  }

  refreshItem(id) {
    var self = this;
    Channel.findOne({_id: this.id}, function(error, data) {
      //only allow a single client to trigger a refresh
      if(self.socket.client.id === data.users[0].socketId) {
        Channel.findOne({"playlist._id": id}, {"playlist.$": 1}, function(error, data) {
          if(error) throw error;
          if(!data) return;

          YoutubeDL.getMedia(data.playlist[0].webpage, false, function(error, files) {
            var data = {
              id: id,
              error: error,
              formats: files[0].formats
            };
            if(!error) Channel.findOneAndUpdate({"playlist._id": id}, {$set: {"playlist.$.formats": files[0].formats}}).exec();
            self.io.of("/channels").to(self.id).emit("refreshItem", data);
          });
        });
      }
    });
  }

  playItem(index) {
    var self = this;
    this.isModerator(function() {
      self.socket.to(self.id).emit("playItem", index);
    });
  }

  loadPlaylist(items) {
    var self = this;
    this.isModerator(function() {
      Channel.findOneAndUpdate({_id: self.id}, {$set: {playlist: items}}, {upsert: true, new: true}, function(error, data) {
        if(error) throw error;

        self.io.of("/channels").to(self.id).emit("loadPlaylist", data.playlist);
      });
    });
  }

  chatMessage(text) {
    var matches = linkify.match(text);
    this.io.of("/channels").to(this.id).emit("chatMessage", {username: this.socket.request.session.username, text: text, urls: matches});
  }

  updateUser(data) {
    data.socketId = this.socket.client.id;
    this.io.of("/channels").to(this.id).emit("updateUser", data);
  }

  moderatorUpdate(data) {
    var self = this;
    this.isModerator(function() {
      Channel.findOneAndUpdate({"users.socketId": data.socketId}, {$set: {"users.$.moderator": data.moderator}}).exec();
      self.io.of("/channels").to(self.id).emit("moderatorUpdate", data);
    });
  }

  isModerator(callback) {
    var self = this;
    Channel.findOne({_id: this.id}, function(error, data) {
      if(error) throw error;

      for(var i = 0; i < data.users.length; i++) {
        if(self.socket.client.id == data.users[i].socketId && data.users[i].moderator) {
          callback();
        }
      }
    });
  }

  disconnect() {
    this.socket.to(this.id).emit("disconnected", {socketId: this.socket.client.id, username: this.socket.request.session.username});

    var self = this;
    Channel.update({_id: this.id}, {$pull: {users: {socketId: this.socket.client.id}}}, function(error, data) {
      if(error) throw error;
      if(!data) return;
      
      self.io.of("/index").emit("decrementUsercount", self.id);

      Channel.findOne({_id: self.id}, function(error, data) {
        if(error) throw error;
        if(!data) return;

        if(data.users.length == 0) {
          Channel.remove({_id: self.id}, function(error) {
            if(error) throw error;
            
            self.io.of("/index").emit("removeChannel", self.id);
          });
        }
        else {
          var noModerator = true;
          for(var i = 0; i < data.users.length; i++) {
            if(data.users[i].moderator) noModerator = false;
          }
          if(noModerator) {
            data = {socketId: data.users[0].socketId, moderator: true};
            Channel.findOneAndUpdate({"users.socketId": data.socketId}, {$set: {"users.$.moderator": data.moderator}}).exec();
            self.io.of("/channels").to(self.id).emit("moderatorUpdate", data);
          }
        }
      });
    });
    console.log(this.socket.client.id + " left " + this.id);
  }
}

module.exports = ChannelSocketController;
