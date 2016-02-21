var UserItem = React.createClass({
  displayName: "UserItem",

  handleClick: function() {
    var data = {
      socketId: this.props.socketId,
      moderator: !this.props.user.moderator
    }
    if(this.props.socketId != socket.id) socket.emit("moderatorUpdate", data);
  },

  render: function() {
    return(
      React.createElement("li", {className: "user"},
        React.createElement("div", {className: "flex"},
          React.createElement("div", {className: "moderator", onClick: this.handleClick},
            React.createElement("span", {className: "fa " + (this.props.user.moderator ? "fa-star" : (this.props.moderator ? "prev-star" : ""))})
          ),
          React.createElement("div", {className: "username"}, this.props.user.username),
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