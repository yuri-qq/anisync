init.components.channel.PlaylistButton = React.createClass({
  displayName: "PlaylistButton",
  propTypes: {
    repeat: React.PropTypes.bool.isRequired,
    repeatToggle: React.PropTypes.func.isRequired,
    shufflePlaylist: React.PropTypes.func.isRequired
  },

  render: function() {
    return(
      React.createElement("div", {id: "playlist-button"},
        React.createElement("div", null,
          React.createElement("div", null, "repeat:"),
          React.createElement("div", {className: "icon repeat " + (this.props.repeat ? "activated" : ""), onClick: this.props.repeatToggle},
            React.createElement("span", {className: "fa fa-2x fa-repeat"})
          )
        ),
        React.createElement("div", null,
          React.createElement("div", null, "shuffle:"),
          React.createElement("div", {className: "icon random", onClick: this.props.shufflePlaylist},
            React.createElement("span", {className: "fa fa-2x fa-random"})
          )
        )
      )
    );
  }
});
