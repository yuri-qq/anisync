// This file is part of anisync.
// Copyright (C) 2020 Jannes Grzebien
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

init.components.channel.PlaylistControls = React.createClass({
  displayName: "PlaylistControls",
  propTypes: {
    disabled: React.PropTypes.bool.isRequired,
    handleInput: React.PropTypes.func.isRequired,
    moderator: React.PropTypes.bool.isRequired,
    inputError: React.PropTypes.bool.isRequired,
    channelId: React.PropTypes.string.isRequired,
    getPlaylist: React.PropTypes.func.isRequired,
    repeat: React.PropTypes.bool.isRequired,
    repeatToggle: React.PropTypes.func.isRequired,
    shufflePlaylist: React.PropTypes.func.isRequired
  },

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
      React.createElement("div", {id: "playlist-controls", className: (this.props.moderator ? "" : "hidden")},
        React.createElement("label", null, 
          React.createElement("input", {
            type: "checkbox",
            checked: this.state.addPlaylist,
            onChange: this.handleCheckboxChange
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
            value: this.state.value,
            onChange: this.handleChange,
            onKeyUp: this.handleKeyUp,
            onBlur: this.handleFocusLose,
            disabled: this.props.disabled
          }),
          React.createElement("button", {
            id: "playlist_add",
            disabled: this.props.disabled,
            onClick: this.handleInput
          }, "add")
        ),
        React.createElement("div", {className: "error " + (!this.props.inputError || this.props.disabled ? "hidden" : "")}, "No compatible video or audio files found"),
        React.createElement("div", {className: "wrapper"},
          React.createElement(init.components.channel.PlaylistLoader, {
            channelId: this.props.channelId,
            getPlaylist: this.props.getPlaylist
          }),
          React.createElement(init.components.channel.PlaylistButton, {
            ref: "playlistButton",
            repeat: this.props.repeat,
            repeatToggle: this.props.repeatToggle,
            shufflePlaylist: this.props.shufflePlaylist
          })
        )
      )
    );
  }
});
