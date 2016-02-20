var UserApp = React.createClass({
  displayName: "UserApp",

  getInitialState: function() {
    return {users: []};
  },

  componentDidMount: function() {
    socket.on("connected", this.connected);
    socket.on("disconnected", this.disconnected);
    socket.on("updateUser", this.updateUser);
  },

  setUsers: function(data) {
    var users = [];
    for(var i = 0; i < data.length; i++) {
      users.push({
        username: data[i].username,
        socketId: data[i].socketId,
        time: "0:00",
        bufferProgress: 0,
        timeProgress: 0
      });
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

  render: function() {
    return(
      React.createElement("ul", {id: "users"}, 
        this.state.users.map(function(user) {
          return React.createElement(UserItem, {key: user.socketId, user: user});
        })
      )
    );
  }
});