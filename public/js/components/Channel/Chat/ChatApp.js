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

init.components.channel.ChatApp = React.createClass({
  displayName: "ChatApp",

  getInitialState: function() {
    return {messages: []};
  },

  componentDidMount: function() {
    socket.on("chatMessage", this.chatMessage);
    socket.on("kickban", this.kickban);
  },

  handleInput: function(input) {
    socket.emit("chatMessage", input);
  },

  connectMessage: function(username) {
    this.appendMessage({info: true, username: username, text: "connected"})
  },

  disconnectMessage: function(username) {
    this.appendMessage({info: true, username: username, text: "disconnected"})
  },

  chatMessage: function(message) {
    message.info = false;
    var date = new Date();
    message.time = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
    this.appendMessage(message);
  },

  kickban: function(data) {
    if(data.socketId == socket.id) window.location = window.location + (data.ban ? "/banned" : "/kicked");
    this.appendMessage({info: true, username: data.username, text: (data.ban ? "was banned" : "was kicked")});
  },

  appendMessage: function(message) {
    var messages = this.state.messages.concat([message]);
    this.setState({messages: messages});
    this.refs.chatWindow.scrollTop = this.refs.chatWindow.scrollHeight;
  },

  render: function() {
    return(
      React.createElement("div", {id: "chat-app"},
        React.createElement("div", {ref: "chatWindow", id: "chat-wrapper"},
          React.createElement("div", {id: "chat"}, 
            this.state.messages.map(function(message, index) {
              return React.createElement(init.components.channel.ChatMessage, {
                key: index,
                info: message.info,
                username: message.username,
                text: message.text,
                urls: message.urls,
                time: message.time
              });
            })
          )
        ),
        React.createElement(init.components.channel.ChatControls, {
          handleInput: this.handleInput
        })
      )
    );
  }
});
