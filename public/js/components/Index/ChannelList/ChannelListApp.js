init.components.index.ChannelListApp = React.createClass({
  displayName: "ChannelListApp",

  getInitialState: function() {
    return {
      channels: [],
      search: "",
      showPrivate: true
    };
  },

  componentDidMount: function() {
    socket.on("setChannels", this.setChannels);
    socket.on("addChannel", this.addChannel);
    socket.on("removeChannel", this.removeChannel);
    socket.on("incrementUsercount", this.incrementUsercount);
    socket.on("decrementUsercount", this.decrementUsercount);
    socket.on("updateChannelName", this.updateChannelName);
  },
  addChannel: function(channel) {
    var channels = this.state.channels.concat([channel]);
    this.setState({channels: channels});
  },

  removeChannel: function(id) {
    var channels = this.state.channels.filter(function(channel) {
      return channel.id !== id;
    });
    this.setState({channels: channels});
  },

  setChannels: function(channels) {
    this.setState({channels: channels});
  },

  incrementUsercount: function(id) {
    var channels = this.state.channels.slice();
    channels.forEach(function(channel, index) {
      if(channels[index].id == id) channels[index].usercount++;
    });

    this.setState({channels: channels});
  },

  decrementUsercount: function(id) {
    var channels = this.state.channels.slice();
    channels.forEach(function(channel, index) {
      if(channels[index].id == id) channels[index].usercount--;
    });

    this.setState({channels: channels});
  },

  search: function(event) {
    this.setState({search: event.target.value})
  },

  privateCheckboxChange: function(event) {
    this.setState({showPrivate: event.target.checked});
  },

  fullCheckboxChange: function(event) {
    this.setState({showFull: event.target.checked});
  },

  updateChannelName: function(data) {
    var channels = this.state.channels.slice();
    for (var i = channels.length - 1; i >= 0; i--) {
      if(channels[i].id == data.id) {
        channels[i].name = data.newName;
        this.setState({channels: channels});
        break;
      }
    }
  },

  render: function() {
    return(
      React.createElement("div", null,
        React.createElement(init.components.index.ChannelControls, {
          ref: "channelControls",
          search: this.search,
          value: this.state.search,
          showPrivate: this.state.showPrivate,
          privateCheckboxChange: this.privateCheckboxChange
        }),
        React.createElement("div", {className: "seperator"}),
        React.createElement("ul", {id: "channels"},
          this.state.channels.map(function(channel) {
            if(((channel.secured && this.state.showPrivate) || !channel.secured) && channel.name.indexOf(this.state.search) > -1) {
              return(
                React.createElement(init.components.index.ChannelItem, {
                  key: channel.id,
                  id: channel.id,
                  name: channel.name,
                  secured: channel.secured,
                  usercount: channel.usercount
                })
              );
            }
          }, this)
        )
      )
    );
  }
});
