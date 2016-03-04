var socket = io.connect("/channels");

var App = React.createClass({
  displayName: "App",

  getInitialState: function() {
    return {moderator: false, channelId: window.location.href.split("/").pop(), lastErrorId: "", canplaythrough: false};
  },

  componentDidMount: function() {
    videoplayer = videojs("video", {
      plugins: {
        videoJsResolutionSwitcher: {
          default: "low"
        }
      }
    }, this.updateStatus);

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

    videoplayer.on("resolutionchange", this.resolutionchange);
    videoplayer.on("ended", this.ended);
    videoplayer.on("error", this.error);
    
    socket.on("joinSetup", function() { socket.emit("joinSetup"); });
    socket.on("play", this.play);
    socket.on("pause", this.pause);
    socket.on("seeked", this.seeked); 
    socket.on("setup", this.setup);
    socket.on("requestTime", this.pushTime);
    socket.on("loadPlaylist", this.loadPlaylist);
    socket.emit("join", this.state.channelId);
  },

  setup: function(data) {
    if(data.users.length > 0) this.refs.userApp.setUsers(data.users);
    if(data.playlist.length > 0) {
      this.refs.playlistApp.refs.playlist.setState({items: data.playlist});
      socket.on("pushTime", this.receiveTime);
      socket.emit("getTime");
    }
  },

  pushTime: function() {
    socket.emit("pushTime", {
      selected: this.refs.playlistApp.refs.playlist.selected(),
      currentTime: videoplayer.currentTime(),
      playing: !videoplayer.paused()
    });
  },

  receiveTime: function(data) {
    socket.off("pushTime");

    var items = this.refs.playlistApp.refs.playlist.state.items.slice();
    items[data.selected].selected = true;
    this.refs.playlistApp.refs.playlist.setState({items: items});

    videoplayer.updateSrc(this.refs.playlistApp.refs.playlist.state.items[data.selected].formats);
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
    setTimeout(this.updateStatus, 400);
  },

  play: function(time) {
    if(typeof time !== "undefined") videoplayer.currentTime(time);
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
    this.setState({canplaythrough: false});

    var self = this;
    //wait until video can be played without having to buffer and report to server that the client is ready
    videoplayer.one("canplaythrough", function() {
      //limit ready emit to one time only (videoplayer.one() unexpectedly fires multiple times)
      if(!self.state.canplaythrough) {
        self.setState({canplaythrough: true});
        socket.emit("ready");
      }
    });

    videoplayer.updateSrc(this.refs.playlistApp.refs.playlist.state.items[index].formats);
  },

  disablePlayer: function() {
    videoplayer.disable();
    this.refs.playlistApp.refs.playlist._sortableInstance.option("disabled", true);
  },

  enablePlayer: function() {
    videoplayer.enable();
    this.refs.playlistApp.refs.playlist._sortableInstance.option("disabled", false);
  },

  // set "high" as default resolution if 720p or greater is selected
  resolutionchange: function() {
    var currentResolution = videoplayer.currentResolution();
    for (var i = currentResolution.sources.length - 1; i >= 0; i--) {
      if(currentResolution.label === currentResolution.sources[i].label) {
        if(currentResolution.sources[i].res >= 720) {
          var options = {default: "high"}; 
        }
        else {
          var options = {default: "low"}; 
        }
        videoplayer.videoJsResolutionSwitcher(options);
      }
    }
  },

  setModerator: function(moderator) {
    this.setState({moderator: moderator});
  },

  isModerator: function() {
    for(var i = 0; i < this.refs.userApp.state.users.length; i++) {
      if(this.refs.userApp.state.users[i].socketId == socket.id) return this.refs.userApp.state.users[i].moderator;
    }
  },

  loadPlaylist: function(items) {
    videoplayer.pause();
    items[0].selected = true;
    this.setState({lastErrorId: ""});
    this.refs.playlistApp.refs.playlist.setState({items: items}, function() {
      this.playItem(0);
    });
  },

  error: function(e) {
    var error = videoplayer.error();
    //error code 4: video not supported (or video url expired etc.)
    if(error.code === 4) {
      var items = this.refs.playlistApp.refs.playlist.state.items.slice();
      var i = this.refs.playlistApp.refs.playlist.selected();
      var id = items[i].id;
      //don't try to get a new url for a video twice in a row
      if(id !== this.state.lastErrorId) {
        this.setState({lastErrorId: id});
        items[i].refreshing = true;
        socket.emit("refreshItem", id);
      }
      else {
        //video url threw same error again, refreshing failed
        items[i].error = true;
      }
      this.refs.playlistApp.refs.playlist.setState({items: items});
    }
  },

  render: function() {
    return(
      React.createElement("div", {id: "app"},
        React.createElement(VideoApp, {ref: "player"}),
        React.createElement(ChatApp, {ref: "chatApp"}),
        React.createElement(PlaylistApp, {ref: "playlistApp", playItem: this.playItem, moderator: this.state.moderator}),
        React.createElement(UserApp, {
          ref: "userApp",
          chatApp: this.refs.chatApp,
          disablePlayer: this.disablePlayer,
          enablePlayer: this.enablePlayer,
          moderator: this.state.moderator,
          setModerator: this.setModerator
        })
      )
    );
  }
});
