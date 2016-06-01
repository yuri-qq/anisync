init.components.channel.App = React.createClass({
  displayName: "App",

  getInitialState: function() {
    return {
      moderator: false,
      channelId: init.channelId,
      name: init.name,
      onFocusName: "",
      lastErrorId: "",
      canplaythrough: false,
      item: null
    };
  },

  componentDidMount: function() {
    var self = this;
    this.videoplayer = videojs("video", {
      plugins: {
        videoJsResolutionSwitcher: {
          default: "low"
        }
      }
    }, function() {
      this.volume(typeof localStorage.volume !== "undefined" ? JSON.parse(localStorage.volume) : 1);
      self.updateStatus();
      this.disableControls = function() {
        this.tech_.el().style["pointer-events"] = "none";
        this.controlBar.progressControl.el().style["pointer-events"] = "none";
        this.controlBar.playToggle.el().style["pointer-events"] = "none";
        this.bigPlayButton.el().style["pointer-events"] = "none";
      };

      this.enableControls = function() {
        this.tech_.el().style["pointer-events"] = "auto";
        this.controlBar.progressControl.el().style["pointer-events"] = "auto";
        this.controlBar.playToggle.el().style["pointer-events"] = "auto";
        this.bigPlayButton.el().style["pointer-events"] = "auto";
      };
    });

    this.videoplayer.tech_.on("click", this.togglePlay);
    this.videoplayer.controlBar.playToggle.on("click", this.togglePlay);
    this.videoplayer.controlBar.progressControl.seekBar.on("mouseup", this.clickedProgressbar);

    this.videoplayer.on("volumechange", this.volumechange);
    this.videoplayer.on("resolutionchange", this.resolutionchange);
    this.videoplayer.on("ended", this.ended);
    this.videoplayer.on("error", this.error);
    
    socket.on("joinSetup", function() { socket.emit("joinSetup"); });
    socket.on("play", this.play);
    socket.on("pause", this.pause);
    socket.on("seeked", this.seeked); 
    socket.on("setup", this.setup);
    socket.on("requestTime", this.pushTime);
    socket.on("loadPlaylist", this.loadPlaylist);
    socket.on("updateChannelName", this.updateChannelName);
    socket.emit("join", this.state.channelId);

    /**
     * ask user if he really wants to leave the page
     * @return {String} message to the user
     */
    window.onbeforeunload = function() {
      return "If you are the last user in this channel, the channel will be removed.";
    }
  },

  setup: function(data) {
    if(data.users.length > 0) this.refs.userApp.setUsers(data.users);
    if(data.playlist.length > 0) {
      this.refs.playlistApp.refs.playlist.setState({items: data.playlist});
      this.refs.playlistApp.setState({repeat: data.repeat});
      socket.on("pushTime", this.receiveTime);
      socket.emit("getTime");
    }
  },

  pushTime: function() {
    socket.emit("pushTime", {
      selected: this.refs.playlistApp.refs.playlist.selected(),
      currentTime: this.videoplayer.currentTime(),
      playing: !this.videoplayer.paused()
    });
  },

  receiveTime: function(data) {
    var self = this;
    socket.off("pushTime");

    var items = this.refs.playlistApp.refs.playlist.state.items.slice();
    items[data.selected].selected = true;
    this.refs.playlistApp.refs.playlist.setState({items: items});

    this.setState({item: this.refs.playlistApp.refs.playlist.state.items[data.selected]});
    this.videoplayer.updateSrc(this.refs.playlistApp.refs.playlist.state.items[data.selected].formats);
    this.videoplayer.on("loadedmetadata", function() {
      self.videoplayer.off("loadedmetadata");
      self.videoplayer.currentTime(data.currentTime);
      if(data.playing) {
        self.videoplayer.play();
      }
    });
  },

  updateStatus: function() {
    var status = {};
    status.bufferProgress = (this.videoplayer.bufferedPercent() * 100).toFixed(3);
    if(this.videoplayer.duration() === 0) {
      status.timeProgress = 0;
    }
    else {
      status.timeProgress = (this.videoplayer.currentTime() / this.videoplayer.duration() * 100).toFixed(3);
    }
    status.time = Math.floor(this.videoplayer.currentTime() / 60) + ":" + ("0" + Math.floor(this.videoplayer.currentTime()) % 60).slice(-2);

    socket.emit("updateUser", status);
    setTimeout(this.updateStatus, 400);
  },

  play: function(time) {
    if(typeof time !== "undefined") this.videoplayer.currentTime(time);
    this.videoplayer.play();
  },

  pause: function(time) {
    this.videoplayer.currentTime(time);
    this.videoplayer.pause();
  },

  seeked: function(time) {
    this.videoplayer.currentTime(time);
  },

  togglePlay: function() {
    if(this.videoplayer.paused()) {
      socket.emit("pause", this.videoplayer.currentTime());
    }
    else {
      socket.emit("play", this.videoplayer.currentTime());
    }
  },

  clickedProgressbar: function() {
    socket.emit("seeked", this.videoplayer.currentTime());
  },

  ended: function() {
    socket.emit("ended");
  },

  playItem: function(index) {
    this.setState({canplaythrough: false, item: this.refs.playlistApp.refs.playlist.state.items[index]});

    var self = this;
    //wait until video can be played without having to buffer and report to server that the client is ready
    this.videoplayer.one("canplaythrough", function() {
      //limit ready emit to one time only (videoplayer.one() unexpectedly fires multiple times)
      if(!self.state.canplaythrough) {
        self.setState({canplaythrough: true});
        socket.emit("ready");
      }
    });

    this.videoplayer.updateSrc(this.refs.playlistApp.refs.playlist.state.items[index].formats);
  },

  disablePlayer: function() {
    this.videoplayer.disableControls();
    this.refs.playlistApp.refs.playlist._sortableInstance.option("disabled", true);
  },

  enablePlayer: function() {
    this.videoplayer.enableControls();
    this.refs.playlistApp.refs.playlist._sortableInstance.option("disabled", false);
  },

  volumechange: function() {
    localStorage.setItem("volume", JSON.stringify(this.videoplayer.volume()));
  },

  // set "high" as default resolution if 720p or greater is selected
  resolutionchange: function() {
    var currentResolution = this.videoplayer.currentResolution();
    for (var i = currentResolution.sources.length - 1; i >= 0; i--) {
      if(currentResolution.label === currentResolution.sources[i].label) {
        var options;
        if(currentResolution.sources[i].res >= 720) {
          options = {default: "high"}; 
        }
        else {
          options = {default: "low"}; 
        }
        this.videoplayer.videoJsResolutionSwitcher(options);
      }
    }
  },

  setItem: function(data) {
    this.setState({item: data});
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
    this.videoplayer.pause();
    items[0].selected = true;
    this.setState({lastErrorId: ""});
    this.refs.playlistApp.refs.playlist.setState({items: items}, function() {
      this.playItem(0);
    });
  },

  error: function() {
    var items;
    var error = this.videoplayer.error();

    //video mime type known, but no source supported by this browser
    if(error.code === -1) {
      //"fake" ready event so video starts playing for other clients
      socket.emit("ready");
      items = this.refs.playlistApp.refs.playlist.state.items.slice();
      items[this.refs.playlistApp.refs.playlist.selected()].error = true;
      this.refs.playlistApp.refs.playlist.setState({items: items}, function() {
        //"fake" ended event, so the playlist switches to the next video when video ended
        socket.emit("ended");
      });
    }

    //video not supported (or video url expired, not available etc.)
    if(error.code === 4) {
      items = this.refs.playlistApp.refs.playlist.state.items.slice();
      var i = this.refs.playlistApp.refs.playlist.selected();
      var id = items[i].id;
      //don't try to get a new url for a video twice in a row
      if(id !== this.state.lastErrorId) {
        this.setState({lastErrorId: id});
        items[i].refreshing = true;
        //try to get a new video url in case current video url expired
        socket.emit("refreshItem", id);
      }
      else {
        //video url threw same error again, refreshing failed
        items[i].error = true;
      }
      this.refs.playlistApp.refs.playlist.setState({items: items});
    }
  },

  updateChannelName: function(newName) {
    this.setState({name: newName});
  },

  handleFocus: function() {
    this.setState({onFocusName: this.state.name});
  },

  handleBlur: function(event) {
    if(this.state.name && this.state.name.length <= 150) {
      socket.emit("editChannelName", this.state.name);
    }
    else {
      this.setState({name: this.state.onFocusName});
    }
    event.target.setSelectionRange(0, 0);
  },

  handleChange: function(name) {
    this.setState({name: name});
  },

  handleKeyUp: function(event) {
    if(event.key === "Enter") {
      event.target.blur();
    }
  },

  render: function() {
    return(
      React.createElement("div", {id: "app"},
        React.createElement(init.components.lib.MaxLengthInput, {
          type: "text",
          id: "channel-name-input",
          name: "channelName",
          value: this.state.name,
          disabled: this.state.moderator ? "" : "disabled",
          handleFocus: this.handleFocus,
          handleBlur: this.handleBlur,
          onKeyUp: this.handleKeyUp,
          update: this.handleChange,
          maxStringLength: 150,
          hideOnBlur: true,
          negativeMargin: true
        }),
        React.createElement("div", {id: "nowPlaying"},
          React.createElement("div", {className: "title " + (this.state.item ? "" : "invisible")},
            React.createElement("span", {className: "pretext"}, this.state.item ? "Now playing: " : ""),
            React.createElement("span", null, this.state.item ? this.state.item.title : "")
          ),
          React.createElement("a", {
              className: "icon " + (this.state.item ? "" : "hidden"),
              href: this.state.item ? this.state.item.webpage : "",
              target: "_blank"
            },
            React.createElement("span", {className: "fa fa-external-link"})
          ),
          React.createElement("a", {
              className: "icon " + (this.state.item ? "" : "hidden"),
              href: this.state.item ? this.state.item.formats[0].src : "",
              download: "download",
              target: "_blank"
            },
            React.createElement("span", {className: "fa fa-download"})
          )
        ),
        React.createElement("div", {id: "channel"},
          React.createElement(init.components.channel.VideoApp, {ref: "player"}),
          React.createElement(init.components.channel.ChatApp, {ref: "chatApp"}),
          React.createElement(init.components.channel.PlaylistApp, {
            ref: "playlistApp",
            setItem: this.setItem,
            videoplayer: this.videoplayer,
            playItem: this.playItem,
            moderator: this.state.moderator
          }),
          React.createElement(init.components.channel.UserApp, {
            ref: "userApp",
            chatApp: this.refs.chatApp,
            disablePlayer: this.disablePlayer,
            enablePlayer: this.enablePlayer,
            moderator: this.state.moderator,
            setModerator: this.setModerator
          })
        )
      )
    );
  }
});
