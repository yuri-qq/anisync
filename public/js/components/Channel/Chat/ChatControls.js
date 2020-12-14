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
