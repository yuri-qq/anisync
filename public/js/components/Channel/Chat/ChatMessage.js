var ChatMessage = React.createClass({
  displayName: "ChatMessage",

  render: function() {
    if(this.props.info) {
      return(
        React.createElement("div", {className: "message"},
          React.createElement("div", {className: "info"}, this.props.username + " " + this.props.text)
        )
      );
    }
    else {
      return(
        React.createElement("div", {className: "message"},
          React.createElement("div", {className: "username"}, this.props.username + ":"),
          React.createElement("div", {className: "text"}, this.props.text)
        )
      );
    }
  }
});