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
          React.createElement("div", {className: "header"},
            React.createElement("span", {className: "time"}, "[" + this.props.time + "]"),
            React.createElement("span", {className: "username"}, this.props.username + ":")
          ),
          React.createElement(Linkify, {className: "text", urls: this.props.urls}, this.props.text)
        )
      );
    }
  }
});
