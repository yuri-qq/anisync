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

init.components.join.App = React.createClass({
    displayName: "App",

    getInitialState: function() {
        return {
            username: init.username ? init.username : "",
            password: "",
            secured: init.secured,
            errors: {}
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
            channelId: init.channelId
        });
    },

    handleErrors: function(errors) {
        this.setState({errors: errors});
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
