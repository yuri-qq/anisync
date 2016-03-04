var PlaylistApp = React.createClass({
  displayName: "PlaylistApp",

  getInitialState: function() {
    return {disableInput: false, inputError: false};
  },

  componentDidMount: function() {
    socket.on("addItems", this.addItems);
    socket.on("removeItem",this.removeItem);
    socket.on("moveItem", this.moveItem);
    socket.on("refreshItem", this.refreshItem);
    socket.on("loadPlaylist", this.loadPlaylist);
  },

  addItems: function(data) {
    if(data.error) {
      this.setState({inputError: true});
    }
    else {
      this.setState({inputError: false});
      this.refs.playlist.addItems(data);
    }
    this.clearInput();
  },

  removeItem: function(index) {
    this.refs.playlist.removeItem(index);
  },

  moveItem: function(data) {
    this.refs.playlist.moveItem(data.oldIndex, data.newIndex);
  },

  refreshItem: function(data) {
    var items = this.refs.playlist.state.items.slice();
    for(var i = 0; i < items.length; i += 1) {
      if(items[i].id == data.id) {
        items[i].refreshing = false;
        if(!data.error) {
          items[i].formats = data.formats;
          items[i].error = false;
        }
        else {
          items[i].error = true;
        }
        
        this.refs.playlist.setState({items: items}, function() {
          //start playing only if user didn't switch to another video in the meantime
          if(i === this.refs.playlist.selected()) this.refs.playlist.playItem(i);
        }.bind(this));
        break;
      }
    }
  },

  handleInput: function(value, addPlaylist) {
    this.setState({disableInput: true});
    socket.emit("addItems", {url: value, addPlaylist: addPlaylist});
  },

  clearInput: function() {
    this.setState({disableInput: false});
    this.refs.playlistControls.clearInput();
  },

  getPlaylist: function() {
    return this.refs.playlist.state.items;
  },

  render: function() {
    return(
      React.createElement("div", {id: "playlist-app"},
        React.createElement(PlaylistControls, {ref: "playlistControls", getPlaylist: this.getPlaylist, disabled: this.state.disableInput, inputError: this.state.inputError, handleInput: this.handleInput, moderator: this.props.moderator}),
        React.createElement(Playlist, {ref: "playlist", playItem: this.props.playItem, moderator: this.props.moderator})
      )
    );
  }
});
