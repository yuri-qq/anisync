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

init.components.create.App = React.createClass({
    displayName: "App",

    getInitialState: function() {
        return {
            username: init.username ? init.username : "",
            channelname: "",
            passwordCheckbox: false,
            password: "",
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
        socket.emit("create", {
            username: this.state.username,
            channelname: this.state.channelname,
            secured: this.state.passwordCheckbox,
            password: this.state.password
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
                    React.createElement(init.components.lib.MaxLengthInput, {
                        className: errors.channelname ? "error" : "",
                        type: "text",
                        name: "channelname",
                        placeholder: "channel name",
                        maxStringLength: 150,
                        negativeMargin: true,
                        hideOnBlur: true,
                        value: this.state.channelname,
                        update: this.channelnameInputChange
                    }),
                    React.createElement("label", null,
                        React.createElement("input", {
                            type: "checkbox",
                            name: "secured",
                            checked: this.state.passwordCheckbox,
                            onChange: this.passwordCheckboxChange
                        }, "set a password")
                    ),
                    React.createElement("input", {
                        className: (this.state.passwordCheckbox ? "" : "hidden ") + (errors.password ? "error" : ""),
                        type: "password",
                        name: "password",
                        placeholder: "channel password",
                        value: this.state.password,
                        onChange: this.passwordInputChange
                    }),
                    React.createElement("input", {
                        className: "button",
                        type: "submit",
                        value: "Create",
                        onClick: this.submit
                    }),
                    React.createElement("div", {
                        className: errors.other ? "error" : "hidden"
                    }, errors.other ? errors.other.message : "")
                )
            )
        );
    }
});
