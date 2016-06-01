init.components.channel.UserItem = React.createClass({
  displayName: "UserItem",
  propTypes: {
    socketId: React.PropTypes.string.isRequired,
    user: React.PropTypes.shape({
      username: React.PropTypes.string.isRequired,
      socketId: React.PropTypes.string.isRequired,
      time: React.PropTypes.string.isRequired,
      bufferProgress: React.PropTypes.number.isRequired,
      timeProgress: React.PropTypes.number.isRequired,
      moderator: React.PropTypes.bool.isRequired
    }).isRequired,
    kickban: React.PropTypes.func.isRequired,
    moderator: React.PropTypes.bool.isRequired
  },

  handleClick: function() {
    var data = {
      socketId: this.props.socketId,
      moderator: !this.props.user.moderator
    }
    if(this.props.socketId != socket.id) socket.emit("moderatorUpdate", data);
  },

  handleKick: function() {
    this.props.kickban(this.props.user.socketId, false);
  },

  handleBan: function() {
    this.props.kickban(this.props.user.socketId, true);
  },

  render: function() {
    return(
      React.createElement("li", {className: "user"},
        React.createElement("div", {className: "flex"},
          React.createElement("div", {className: "moderator", onClick: this.handleClick},
            React.createElement("span", {className: "fa " + (this.props.user.moderator ? "fa-star" : (this.props.moderator ? "prev-star" : ""))})
          ),
          React.createElement("div", {className: "username"}, this.props.user.username),
          React.createElement("div", {className: "mod-buttons " + (this.props.user.socketId == socket.id || !this.props.moderator ? "hidden" : "")},
            React.createElement("span", {onClick: this.handleKick},
              React.createElement("span", {className: "fa fa-user-times"})
            ),
            React.createElement("span", {onClick: this.handleBan},
              React.createElement("span", {className: "fa-stack"},
                React.createElement("span", {className: "fa fa-user fa-stack-1x"}),
                React.createElement("span", {className: "fa fa-ban fa-stack-2x text-danger"})
              )
            )
          ),
          React.createElement("div", {className: "time"}, this.props.user.time)
        ),
        React.createElement("div", {className: "progress"},
          React.createElement("div", {className: "bufferProgress", style: {width: this.props.user.bufferProgress + "%"}}),
          React.createElement("div", {className: "timeProgress", style: {width:  this.props.user.timeProgress + "%"}})
        )
      )
    );
  }
});
