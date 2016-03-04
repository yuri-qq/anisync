var ChatApp = React.createClass({
  displayName: "ChatApp",

  getInitialState: function() {
    return {messages: []};
  },

  componentDidMount: function() {
    socket.on("chatMessage", this.chatMessage);
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
    message.time = date.getHours() + ":" + date.getMinutes();
    this.appendMessage(message)
  },

  appendMessage: function(message) {
    var messages = this.state.messages.concat([message]);
    this.setState({messages: messages});
    this.refs.chatWindow.scrollTop = this.refs.chatWindow.scrollHeight;
  },

  render: function() {
    return(
      React.createElement("div", {id: "chat-app"}, 
        React.createElement("div", {ref: "chatWindow", id: "chat"}, 
          this.state.messages.map(function(message, index) {
            return React.createElement(ChatMessage, {key: index, info: message.info, username: message.username, text: message.text, urls: message.urls, time: message.time});
          })
        ),
        React.createElement(ChatControls, {handleInput: this.handleInput})
      )
    );
  }
});
