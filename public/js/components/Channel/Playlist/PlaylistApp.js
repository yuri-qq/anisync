var PlaylistApp = React.createClass({
  displayName: "PlaylistApp",

  getInitialState: function() {
    return {disableInput: false, inputError: false};
  },

  componentDidMount: function() {
    socket.on("addItems", this.addItems);
    socket.on("removeItem",this.removeItem);
    socket.on("moveItem", this.moveItem);
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

  loadPlaylist: function(items) {
    items[0].selected = true;
    this.refs.playlist.setState({items: items}, function() {
      this.props.playItem(0);
    });
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