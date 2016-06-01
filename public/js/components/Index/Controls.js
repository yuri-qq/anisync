init.components.index.Controls = React.createClass({
  displayName: "Controls",

  getInitialState: function() {
    return {
      username: init.username,
      errors: {}
    };
  },

  componentDidMount: function() {
    socket.on("errors", this.handleErrors);
  },

  handleChange: function(username) {
    this.setState({username: username});
  },

  handleKeyUp: function(event) {
    if(event.keyCode == 13) {
      this.setUsername(this.state.username);
    }
  },

  handleClick: function() {
    this.setUsername(this.state.username);
  },

  setUsername: function(username) {
    this.setState({errors: {}});
    socket.emit("setUsername", username);
  },

  handleErrors: function(errors) {
    this.setState({errors: errors});
  },

  render: function() {
    return(
      React.createElement("div", {id: "controls"}, 
        React.createElement("div", {className: "forms"},
          React.createElement("div", {className: "input-button"},
            React.createElement(init.components.lib.MaxLengthInput, {
              className: this.state.errors.username ? "error" : "",
              id: "username",
              type: "text",
              placeholder: "choose a username",
              onKeyUp: this.handleKeyUp,
              update: this.handleChange,
              maxStringLength: 60,
              hideOnBlur: true,
              value: this.state.username
            }),
            React.createElement("button", {
              onClick: this.handleClick
            }, "save")
          ),
          React.createElement("div", {className: "button"},
            React.createElement("a", {href: "/create"}, "create a channel")
          )
        ),
        React.createElement("div", {id: "description"}, "AniSync - a service to synchronize media playback between browsers.\nWatch and listen to media files together with your friends all over the world!\nWe support HTML5 videos from almost any site. Try it out, join a channel or create your own. (No registration required!)")
      )
    );
  }
});