init.components.channel.ChatMessage = React.createClass({
  displayName: "ChatMessage",
  propTypes: {
    info: React.PropTypes.bool.isRequired,
    username: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired,
    time: React.PropTypes.string.isRequired,
    urls: React.PropTypes.arrayOf(React.PropTypes.shape({
      schema: React.PropTypes.string.isRequired,
      index: React.PropTypes.number.isRequired,
      lastIndex: React.PropTypes.number.isRequired,
      raw: React.PropTypes.string.isRequired,
      text: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired
    }))
  },

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
          React.createElement(init.components.lib.Linkify, {
            className: "text",
            urls: this.props.urls
          }, this.props.text)
        )
      );
    }
  }
});
