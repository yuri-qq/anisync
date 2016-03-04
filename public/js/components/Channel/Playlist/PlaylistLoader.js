var PlaylistLoader = React.createClass({
  displayName: "PlaylistLoader",

  getInitialState: function() {
    if(localStorage.playlists) var playlists = JSON.parse(localStorage.playlists);

    return {playlists: playlists || {}, selectValue: "", value: ""};
  },

  save: function() {
    if(this.state.value) {
      var playlist = this.props.getPlaylist();
      if(playlist.length > 0) {
        //use JSON.parse(JSON.stringify(obj)) to create copy of object since state is immutable
        var playlists = JSON.parse(JSON.stringify(this.state.playlists));
        playlists[this.state.value] = playlist;
        this.setState({selectValue: this.state.value, playlists: playlists});
        localStorage.setItem("playlists", JSON.stringify(playlists));
      }
    }
  },

  load: function() {
    if(this.state.selectValue) socket.emit("loadPlaylist", this.state.playlists[this.state.selectValue]);
  },

  remove: function() {
    var playlists = JSON.parse(JSON.stringify(this.state.playlists));
    delete playlists[this.state.value];
    this.setState({playlists: playlists, selectValue: "", value: ""});
    localStorage.setItem("playlists", JSON.stringify(playlists));
  },

  handleChange: function(event) {
    this.setState({selectValue: event.target.value, value: event.target.value});
  },

  handleInput: function(event) {
    this.setState({value: event.target.value});
  },

  render: function() {
    return(
      React.createElement("div", {id: "loader"},
        React.createElement("div", null, "load or save a playlist:"),
        React.createElement("div", {className: "input-button"},
          React.createElement("select", {value: this.state.selectValue, onChange: this.handleChange},
            React.createElement("option", {selected: true, disabled: true, style: {display: "none"}}, "---"),
            Object.keys(this.state.playlists).map(function(value, index) {
              return React.createElement("option", {value: value}, value);
            })
          ),
          React.createElement("button", {className: "load", onClick: this.load}, "load"),
          React.createElement("button", {className: "remove", onClick: this.remove}, "remove")
        ),
        React.createElement("div", {className: "input-button"},
          React.createElement("input", {type: "text", value: this.state.value, onChange: this.handleInput}),
          React.createElement("button", {className: "save", onClick: this.save}, "save/add")
        )
      )
    );
  }
});
