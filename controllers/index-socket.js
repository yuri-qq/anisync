var Channel = require("../models/channel");

function IndexSocketController(io) {
  if(!(this instanceof IndexSocketController)) return new IndexSocketController(io);

  this.io = io;

  this.io.of("/index").on("connection", Socket.bind(this));
}

function Socket(socket, io) {
  if(!(this instanceof Socket)) return new Socket(socket, this.io);

  this.io = io;
  this.socket = socket;

  console.log(this.socket.client.id + " connected");

  this.socket.on("setUsername", this.setUsername.bind(this));
  Channel.find({}, this.setChannels.bind(this));
}

Socket.prototype = {
  setUsername: function(username) {
    this.socket.request.session.username = username;
    this.socket.request.session.save();
  },

  setChannels: function(error, channels) {
    channels.forEach(function(channel, index) {
      channels[index] = channel.toIndex();
    });

    this.socket.emit("setChannels", channels);
  },

  disconnect: function() {
    console.log(this.socket.client.id +  " disconnected");
  }
};

Socket.prototype.contructor = Socket;

module.exports = IndexSocketController;