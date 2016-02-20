var ChatControls = React.createClass({
  displayName: "ChatControls",

  getInitialState: function() {
    return {value: ""};
  },

  handleChange: function(event) {
    this.setState({value: event.target.value});
  },

  handleKeyUp: function(event) {
    if(event.key === "Enter") this.handleInput();
  },

  handleInput: function() {
    if(this.state.value) {
      this.props.handleInput(this.state.value);
      this.setState({value: ""});
    }
  },

  render: function() {
    return(
      React.createElement("div", {className: "input-button"},
        React.createElement("input", {type: "text", placeholder: "type a message", value: this.state.value, onChange: this.handleChange, onKeyUp: this.handleKeyUp}),
        React.createElement("button", {className: "button", disabled: this.props.disabled, onClick: this.handleInput}, "send")
      )
    );
  }
});