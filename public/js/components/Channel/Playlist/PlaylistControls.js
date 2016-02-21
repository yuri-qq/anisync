var PlaylistControl = React.createClass({
  displayName: "PlaylistControl",

  getInitialState: function() {
    return {value: "", addPlaylist: false};
  },

  handleCheckboxChange: function(event) {
    this.setState({addPlaylist: event.target.checked});
  },

  handleChange: function(event) {
    this.setState({value: event.target.value});
  },

  handleKeyUp: function(event) {
    if(event.key === "Enter") this.handleInput();
  },

  handleInput: function() {
    if(!this.props.disabled && this.state.value) {
      this.props.handleInput(this.state.value, this.state.addPlaylist);
    }
  },

  handleFocusLose: function(event) {
    event.target.selectionStart = 0;
    event.target.selectionEnd = 0;
  },

  clearInput: function() {
    this.setState({value: ""});
  },

  render: function() {
    return(
      React.createElement("div", {id: "playlist-controls"},
        React.createElement("label", null, 
          React.createElement("input", {
            type: "checkbox",
            checked: this.state.addPlaylist,
            onChange: this.handleCheckboxChange,
            disabled: (this.props.moderator ? false : true)
          }),
          React.createElement("span", null, "add a playlist")
        ),
        React.createElement("div", {className: "la-ball-clip-rotate la-dark " + (this.props.disabled ? "" : "hidden")},
          React.createElement("div", null) 
        ),
        React.createElement("div", {className: "input-button"},
          React.createElement("input", {
            id: "media_url",
            className: (this.props.inputError && !this.props.disabled ? "error" : ""),
            type: "text",
            placeholder: "paste video or audio url here",
            value: this.state.value, disabled: this.props.disabled,
            onChange: this.handleChange, onKeyUp: this.handleKeyUp,
            onBlur: this.handleFocusLose,
            disabled: (this.props.moderator ? false : true)
          }),
          React.createElement("button", {id: "playlist_add", className: "button", disabled: this.props.disabled, onClick: this.handleInput}, "add")
        ),
        React.createElement("div", {className: "error " + (!this.props.inputError || this.props.disabled ? "hidden" : "")}, "No compatible video or audio files found")
      )
    );
  }
});