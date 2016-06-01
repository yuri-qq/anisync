init.components.channel.ChatControls = React.createClass({
  displayName: "ChatControls",
  propTypes: {
    handleInput: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      message: ""
    };
  },

  handleChange: function(message) {
    this.setState({message: message});
  },

  handleKeyUp: function(event) {
    if(event.key === "Enter") this.handleInput();
  },

  handleInput: function() {
    if(this.state.message && this.state.message.length <= 1000) {
      this.props.handleInput(this.state.message);
      this.setState({message: ""});
    }
  },

  render: function() {
    return(
      React.createElement("div", {className: "input-button"},
        React.createElement(init.components.lib.MaxLengthInput, {
          ref: "messageInput",
          type: "text",
          placeholder: "type a message",
          onKeyUp: this.handleKeyUp,
          maxStringLength: 1000,
          value: this.state.message,
          update: this.handleChange
        }),
        React.createElement("button", {
          onClick: this.handleInput
        }, "send")
      )
    );
  }
});
