var UserItem = React.createClass({
  displayName: "UserItem",

  render: function() {
    return(
      React.createElement("li", {className: "user"}, 
        React.createElement("div", {className: "time"}, this.props.user.time),
        React.createElement("div", {className: "username"}, this.props.user.username),
        React.createElement("div", {className: "progress"},
          React.createElement("div", {className: "bufferProgress", style: {width: this.props.user.bufferProgress + "%"}}),
          React.createElement("div", {className: "timeProgress", style: {width:  this.props.user.timeProgress + "%"}})
        )
      )
    );
  }
});