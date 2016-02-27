var PlaylistApp = React.createClass({
  displayName: "PlaylistApp",

  getInitialState: function() {
    return {disableInput: false, inputError: false};
  },

  componentDidMount: function() {
    socket.on("addItem", this.addItems);
    socket.on("removeItem",this.removeItem);
    socket.on("moveItem", this.moveItem);
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
    socket.emit("addItem", {url: value, addPlaylist: addPlaylist});
  },

  clearInput: function() {
    this.setState({disableInput: false});
    this.refs.playlistControl.clearInput();
  },

  render: function() {
    return(
      React.createElement("div", {id: "playlist-app"},
        React.createElement(PlaylistControl, {ref: "playlistControl", disabled: this.state.disableInput, inputError: this.state.inputError, handleInput: this.handleInput, moderator: this.props.moderator}),
        React.createElement(Playlist, {ref: "playlist", playItem: this.props.playItem, moderator: this.props.moderator})
      )
    );
  }
});