var Channel = require("../models/channel");
var youtubedl = require("youtube-dl");

function ChannelSocketController(io, config) {
  if(!(this instanceof ChannelSocketController)) return new ChannelSocketController(io, config);

  this.io = io;
  this.config = config;

  this.io.of("/channels").on("connection", Socket.bind(this));
}

function Socket(socket, io, config) {
  if(!(this instanceof Socket)) return new Socket(socket, this.io, this.config);

  this.io = io;
  this.config = config;
  this.socket = socket;
  this.socket.on("join", this.join.bind(this));
}

Socket.prototype = {
  join: function(id) {
    this.id = id;
    this.socket.on("getTime", this.getTime.bind(this));
    this.socket.on("pushTime", this.pushTime.bind(this));
    this.socket.on("ready", this.ready.bind(this));
    this.socket.on("play", this.play.bind(this));
    this.socket.on("pause", this.pause.bind(this));
    this.socket.on("seeked", this.seeked.bind(this));
    this.socket.on("addItem", this.addItem.bind(this));
    this.socket.on("removeItem", this.removeItem.bind(this));
    this.socket.on("moveItem", this.moveItem.bind(this));
    this.socket.on("playItem", this.playItem.bind(this));
    this.socket.on("chatMessage", this.chatMessage.bind(this));
    this.socket.on("updateUser", this.updateUser.bind(this));
    this.socket.on("disconnect", this.disconnect.bind(this));

    Channel.findOne({_id: this.id}, function(error, data) {
      if(!data.private || this.socket.request.session.loggedInId == this.id) {

        this.socket.join(this.id);
        console.log(this.socket.client.id + " joined " + id);

        var user = {socketId: this.socket.client.id, username: this.socket.request.session.username};
        this.io.of("/channels").to(this.id).emit("connected", user);
        user.ready = false;
        
        Channel.findOneAndUpdate({_id: this.id}, {$push: {users: user}}, {upsert: true, new: true}, function(error, data) {
          this.socket.emit("setup", data);

          if(data.users.length == 1) {
            var channel = data.toIndex();
            this.io.of("/index").emit("addChannel", channel);
            return;
          }

          this.io.of("/index").emit("incrementUsercount", this.id);
        }.bind(this));

      }
    }.bind(this));
  },

  getTime: function() {
    this.socket.to(this.id).emit("requestTime");
  },

  pushTime: function(data) {
    this.socket.to(this.id).emit("pushTime", data);
  },

  ready: function() {
    Channel.findOneAndUpdate({"users.socketId": this.socket.client.id}, {$set: {"users.$.ready": true}}, {new: true}, function(error, data) {
      var ready = 0;
      data.users.forEach(function(user) {
        if(user.ready) {
          ready++;
        }
      });
      if(ready == data.users.length) {
        data.users.forEach(function(user) {
          Channel.update({"users.socketId": user.socketId}, {$set: {"users.$.ready": false}}).exec();
        });
        this.io.of("/channels").to(this.id).emit("play", 0);
        Channel.update({_id: this.id}, {playing: true}).exec();
      }
    }.bind(this));
  },

  play: function(time) {
    Channel.update({_id: this.id}, {playing: true}).exec();
    this.socket.to(this.id).emit("play", time);
  },

  pause: function(time) {
    Channel.update({_id: this.id}, {playing: false}).exec();
    this.socket.to(this.id).emit("pause", time);
  },

  seeked: function(time) {
    this.socket.to(this.id).emit("seeked", time);
  },

  addItem: function(data) {
    var args = [];
    if(data.url.indexOf("youtube.com") > -1 && this.config.youtubedlProxy.host && this.config.youtubedlProxy.port) args = args.concat(["--proxy", this.config.youtubedlProxy.host + ":" + this.config.youtubedlProxy.port]);
    if(!data.addPlaylist) args = args.concat(["--playlist-end", "1"]);

    youtubedl.getInfo(data.url, args, {maxBuffer: 1024000 * 5}, function(error, media) {
      if(!error) {
        if(Object.prototype.toString.call(media) !== "[object Array]") {
          media = [media];
        }

        var files = [];
        if(data.addPlaylist) {
          media.forEach(function(file) {
            files.push({title: file.title, url: file.url});
          });
        }
        else {
          files[0] = {title: media[0].title, url: media[0].url};
        }

        Channel.findOneAndUpdate({_id: this.id}, {$push: {playlist: {$each: files}}}, {upsert: true, new: true}, function(error, data) {
          files.forEach(function(file, index) {
            files[index].id = data.playlist[data.playlist.length - files.length + index].id;
          });
          this.io.of("/channels").to(this.id).emit("addItem", files);
        }.bind(this));
      }
      else {
        console.log(error);
        this.socket.emit("addItem", {error: error});
      }
    }.bind(this));
  },

  removeItem: function(data) {
    Channel.update({_id: this.id}, {$pull: {playlist: {_id: data.id}}}).exec();
    this.socket.to(this.id).emit("removeItem", data.index);
  },

  moveItem: function(data) {
    Channel.findOne({_id: id}, function(error, channelObject) {
      channelObject.playlist.splice(data.newIndex, 0, channelObject.playlist.splice(data.oldIndex, 1)[0]);
      Channel.update({_id: this.id}, {$set: {playlist: channelObject.playlist}}).exec();
    }.bind(this));
    this.socket.to(this.id).emit("moveItem", {oldIndex: data.oldIndex, newIndex: data.newIndex});
  },

  playItem: function(index) {
    this.socket.to(this.id).emit("playItem", index);
  },

  chatMessage: function(text) {
    this.io.of("/channels").to(this.id).emit("chatMessage", {username: this.socket.request.session.username, text: text});
  },

  updateUser: function(data) {
    data.socketId = this.socket.client.id;
    this.io.of("/channels").to(this.id).emit("updateUser", data);
  },

  disconnect: function() {
    this.socket.to(this.id).emit("disconnected", {socketId: this.socket.client.id, username: this.socket.request.session.username});
    Channel.update({_id: this.id}, {$pull: {users: {socketId: this.socket.client.id}}}, function(error, data) {
      this.io.of("/index").emit("decrementUsercount", this.id);

      Channel.findOne({_id: this.id}, function(error, data) {
        if(data.users.length == 0) {
          Channel.remove({_id: this.id}, function(error) {
            this.io.of("/index").emit("removeChannel", this.id);
          }.bind(this));
        }
      }.bind(this));
    }.bind(this));
    console.log(this.socket.client.id + " left " + this.id);
  }
};

Socket.prototype.constructor = Socket;

module.exports = ChannelSocketController;