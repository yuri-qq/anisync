var socket = io.connect("/channels");

var App = React.createClass({
  displayName: "App",

  getInitialState: function() {
    return {playerHeight: 0, moderator: false};
  },

  componentDidMount: function() {
    videoplayer = videojs("video", {}, this.updateStatus);

    videoplayer.disable = function() {
      document.getElementsByClassName("vjs-tech")[0].style["pointer-events"] = "none";
      document.getElementsByClassName("vjs-progress-control")[0].style["pointer-events"] = "none";
      document.getElementsByClassName("vjs-play-control")[0].style["pointer-events"] = "none";
      document.getElementsByClassName("vjs-big-play-button")[0].style["pointer-events"] = "none";
    }

    videoplayer.enable = function() {
      document.getElementsByClassName("vjs-tech")[0].style["pointer-events"] = "auto";
      document.getElementsByClassName("vjs-progress-control")[0].style["pointer-events"] = "auto";
      document.getElementsByClassName("vjs-play-control")[0].style["pointer-events"] = "auto";
      document.getElementsByClassName("vjs-big-play-button")[0].style["pointer-events"] = "auto";
    }

    //custom events triggered from video.js directly
    //todo: write a plugin so the video.js source doesn't have to be modified
    videoplayer.on("clickedPlay", this.clickedPlay);
    videoplayer.on("clickedPause", this.clickedPause);
    videoplayer.on("clickedProgressbar", this.clickedProgressbar);

    videoplayer.on("ended", this.ended);
    
    socket.on("joinSetup", function() { socket.emit("joinSetup"); });
    socket.on("play", this.play);
    socket.on("pause", this.pause);
    socket.on("seeked", this.seeked); 
    socket.on("setup", this.setup);
    socket.on("requestTime", this.pushTime);
    socket.emit("join", window.location.href.split("/").pop());

    this.updatePlayerHeight();
    window.addEventListener("resize", this.updatePlayerHeight);
  },

  updatePlayerHeight: function() {
    this.setState({playerHeight: this.refs.player.refs.video.clientHeight});
  },

  setup: function(data) {
    if(data.users.length > 0) this.refs.userApp.setUsers(data.users);
    if(data.playlist.length > 0) {
      this.refs.playlistApp.refs.playlist.setItems(data.playlist);
      socket.on("pushTime", this.receiveTime);
      socket.emit("getTime");
    }
  },

  pushTime: function() {
    socket.emit("pushTime", {selected: this.refs.playlistApp.refs.playlist.selected(), currentTime: videoplayer.currentTime(), playing: !videoplayer.paused()});
  },

  receiveTime: function(data) {
    socket.off("pushTime");

    var items = this.refs.playlistApp.refs.playlist.state.items.slice();
    items[data.selected].selected = true;
    this.refs.playlistApp.refs.playlist.setItems(items);

    videoplayer.src(this.refs.playlistApp.refs.playlist.state.items[data.selected].url);
    videoplayer.on("loadedmetadata", function() {
      videoplayer.off("loadedmetadata");
      videoplayer.currentTime(data.currentTime);
      if(data.playing) {
        videoplayer.play();
      }
    });
  },

  updateStatus: function() {
    var status = {};
    status.bufferProgress = (videoplayer.bufferedPercent() * 100).toFixed(3);
    if(videoplayer.duration() === 0) {
      status.timeProgress = 0;
    }
    else {
      status.timeProgress = (videoplayer.currentTime() / videoplayer.duration() * 100).toFixed(3);
    }
    status.time = Math.floor(videoplayer.currentTime() / 60) + ":" + ("0" + Math.floor(videoplayer.currentTime()) % 60).slice(-2);

    socket.emit("updateUser", status);
    setTimeout(this.updateStatus, 500);
  },

  play: function(time) {
    videoplayer.currentTime(time);
    videoplayer.play();
  },

  pause: function(time) {
    videoplayer.currentTime(time);
    videoplayer.pause();
  },

  seeked: function(time) {
    videoplayer.currentTime(time);
  },

  clickedPlay: function() {
    socket.emit("play", videoplayer.currentTime());
  },

  clickedPause: function() {
    socket.emit("pause", videoplayer.currentTime());
  },

  clickedProgressbar: function() {
    socket.emit("seeked", videoplayer.currentTime());
  },

  ended: function() {
    this.refs.playlistApp.refs.playlist.nextItem();
  },

  playItem: function(index) {
    videoplayer.on("loadedmetadata", function() {
      videoplayer.off("loadedmetadata");
      socket.emit("ready");
    });

    videoplayer.src(this.refs.playlistApp.refs.playlist.state.items[index].url);
  },

  disablePlayer: function() {
    videoplayer.disable();
    this.refs.playlistApp.refs.playlist._sortableInstance.option("disabled", true);
  },

  enablePlayer: function() {
    videoplayer.enable();
    this.refs.playlistApp.refs.playlist._sortableInstance.option("disabled", false);
  },

  setModerator: function(moderator) {
    this.setState({moderator: moderator});
  },

  isModerator: function() {
    for(var i = 0; i < this.refs.userApp.state.users.length; i++) {
      if(this.refs.userApp.state.users[i].socketId == socket.id) return this.refs.userApp.state.users[i].moderator;
    }
  },

  render: function() {
    return(
      React.createElement("div", {id: "app"},
        React.createElement("div", {className: "left"},
          React.createElement(VideoApp, {ref: "player"}),
          React.createElement(PlaylistApp, {ref: "playlistApp", playItem: this.playItem, moderator: this.state.moderator})
        ),
        React.createElement("div", {className: "right"},
          React.createElement(ChatApp, {ref: "chatApp", playerHeight: this.state.playerHeight}),
          React.createElement(UserApp, {ref: "userApp", chatApp: this.refs.chatApp, disablePlayer: this.disablePlayer, enablePlayer: this.enablePlayer, moderator: this.state.moderator, setModerator: this.setModerator})
        )
      )
    );
  }
});