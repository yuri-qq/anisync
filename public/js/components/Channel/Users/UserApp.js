init.components.channel.UserApp = React.createClass({
  displayName: "UserApp",
  propTypes: {
    setModerator: React.PropTypes.func.isRequired,
    enablePlayer: React.PropTypes.func.isRequired,
    disablePlayer: React.PropTypes.func.isRequired,
    chatApp: React.PropTypes.element.isRequired,
    moderator: React.PropTypes.bool.isRequired
  },

  getInitialState: function() {
    return {users: []};
  },

  componentDidMount: function() {
    socket.on("connected", this.connected);
    socket.on("disconnected", this.disconnected);
    socket.on("updateUser", this.updateUser);
    socket.on("moderatorUpdate", this.moderatorUpdate);
  },

  setUsers: function(data) {
    var users = [];
    for(var i = 0; i < data.length; i++) {
      users.push({
        username: data[i].username,
        socketId: data[i].socketId,
        time: "0:00",
        bufferProgress: 0,
        timeProgress: 0,
        moderator: data[i].moderator
      });

      if(data[i].socketId == socket.id) {
        this.props.setModerator(data[i].moderator);
        if(data[i].moderator) {
          this.props.enablePlayer();
        }
        else {
          this.props.disablePlayer();
        }
      }
    }
    users = this.state.users.concat(users);
    this.setState({users: users});
  },

  connected: function(data) {
    if(socket.id !== data.socketId) {
      data.time = "0:00";
      data.bufferProgess = 0;
      data.timeProgress= 0;
      var users = this.state.users.concat([data]);
      this.setState({users: users});
      this.props.chatApp.connectMessage(data.username);
    }
  },

  disconnected: function(data) {
    var users = this.state.users.filter(function(user) {
      return user.socketId !== data.socketId;
    });
    this.setState({users: users});
    this.props.chatApp.disconnectMessage(data.username);
  },

  updateUser: function(data) {
    this.state.users.forEach(function(user, index) {
      if(data.socketId === user.socketId) {
        var users = this.state.users.slice();
        users[index].time = data.time;
        users[index].bufferProgress = data.bufferProgress;
        users[index].timeProgress = data.timeProgress;
        this.setState({users: users});
      }
    }.bind(this));
  },
  
  moderatorUpdate: function(data) {
    var users = this.state.users.slice();
    users.forEach(function(user, index) {
      if(user.socketId == data.socketId) {
        users[index].moderator = data.moderator;
        this.setState({users: users});

        if(user.socketId == socket.id) {
          this.props.setModerator(data.moderator);
          if(data.moderator) {
            this.props.enablePlayer();
          }
          else {
            this.props.disablePlayer();
          }
        }
      }
    }.bind(this));
  },

  kickban: function(socketId, ban) {
    socket.emit("kickban", {socketId: socketId, ban: ban});
  },

  render: function() {
    return(
      React.createElement("div", {id: "users-app"},
        React.createElement("div", {id: "users-header"},
          React.createElement("span", {className: "moderator"}, "mod"),
          React.createElement("span", {className: "username"}, "username"),
          React.createElement("span", {className: "time"}, "time")
        ),
        React.createElement("ul", {id: "users"}, 
          this.state.users.map(function(user) {
            return React.createElement(init.components.channel.UserItem, {
              key: user.socketId,
              socketId: user.socketId,
              user: user,
              moderatorUpdate: this.moderatorUpdate,
              moderator: this.props.moderator,
              kickban: this.kickban
          });
          }, this)
        )
      )
    );
  }
});