init.components.join.App = React.createClass({
  displayName: "App",

  getInitialState: function() {
    return {
      username: init.username ? init.username : "",
      password: "",
      secured: init.secured
    };
  },

  componentDidMount: function() {
    socket.on("errors", this.handleErrors);
  },

  usernameInputChange: function(username) {
    this.setState({username: username});
  },

  channelnameInputChange: function(channelname) {
    this.setState({channelname: channelname});
  },

  passwordCheckboxChange: function(event) {
    this.setState({passwordCheckbox: event.target.checked});
  },

  passwordInputChange: function(event) {
    this.setState({password: event.target.value});
  },

  submit: function() {
    this.setState({errors: {}});
    socket.emit("join", {
      username: this.state.username,
      password: this.state.password,
      channelid: init.channelid
    });
  },

  handleErrors: function(errors) {
    this.setState({errors: errors});
  },

  redirect: function(url) {
    window.location = init.domain ? ("//" + init.domain + url) : url;
  },

  render: function() {
    var errors = this.state.errors;

    return(
      React.createElement("div", {className: "centered-form"},
        React.createElement("div", null,
          React.createElement(init.components.lib.MaxLengthInput, {
            className: (init.username ? "hidden " : "") + (errors.username ? "error" : ""),
            type: "text",
            name: "username",
            placeholder: "username",
            maxStringLength: 60,
            hideOnBlur: true,
            value: this.state.username,
            update: this.usernameInputChange
          }),
          React.createElement("input", {
            className: (this.state.secured ? "" : "hidden ") + (errors.password ? "error" : ""),
            type: "password",
            name: "password",
            placeholder: "channel password",
            value: this.state.password,
            onChange: this.passwordInputChange
          }),
          React.createElement("input", {
            className: "button",
            type: "submit",
            value: "join",
            onClick: this.submit
          })
        )
      )
    );
  }
});
