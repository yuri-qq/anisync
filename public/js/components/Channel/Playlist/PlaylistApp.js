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

init.components.channel.PlaylistApp = React.createClass({
  displayName: "PlaylistApp",
  propTypes: {
    moderator: React.PropTypes.bool.isRequired,
    playItem: React.PropTypes.func.isRequired,
    videoplayer: React.PropTypes.object.isRequired,
    setItem: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      disableInput: false,
      inputError: false,
      repeat: true
    };
  },

  componentDidMount: function() {
    socket.on("addItems", this.addItems);
    socket.on("removeItem",this.removeItem);
    socket.on("moveItem", this.moveItem);
    socket.on("refreshItem", this.refreshItem);
    socket.on("setRepeat", this.setRepeat);
  },

  addItems: function(data) {
    if(data.error) {
      this.setState({inputError: true});
    }
    else {
      this.setState({inputError: false});
      this.refs.playlist.addItems(data);
    }
    this.clearInput();
  },

  removeItem: function(index) {
    this.refs.playlist.removeItem(index);
  },

  moveItem: function(data) {
    this.refs.playlist.moveItem(data.oldIndex, data.newIndex);
  },

  refreshItem: function(data) {
    var items = this.refs.playlist.state.items.slice();
    for(var i = 0; i < items.length; i += 1) {
      if(items[i].id == data.id) {
        items[i].refreshing = false;
        if(!data.error) {
          items[i].formats = data.formats;
          items[i].error = false;
        }
        else {
          items[i].error = true;
        }
        
        this.refs.playlist.setState({items: items}, function() {
          //start playing only if user didn't switch to another video in the meantime
          if(i === this.refs.playlist.selected()) this.refs.playlist.playItem(i);
        }.bind(this));
        break;
      }
    }
  },

  handleInput: function(value, addPlaylist) {
    this.setState({disableInput: true});
    socket.emit("addItems", {url: value, addPlaylist: addPlaylist});
  },

  clearInput: function() {
    this.setState({disableInput: false});
    this.refs.playlistControls.clearInput();
  },

  getPlaylist: function() {
    return this.refs.playlist.state.items;
  },

  repeatToggle: function() {
    socket.emit("setRepeat", !this.state.repeat);
  },

  setRepeat: function(bool) {
    if(this.props.moderator) {
      this.setState({repeat: bool});
    }
  },

  shufflePlaylist: function() {
    this.refs.playlist.shufflePlaylist();
  },

  render: function() {
    return(
      React.createElement("div", {id: "playlist-app"},
        React.createElement(init.components.channel.PlaylistControls, {
          ref: "playlistControls",
          getPlaylist: this.getPlaylist,
          disabled: this.state.disableInput,
          inputError: this.state.inputError,
          handleInput: this.handleInput,
          moderator: this.props.moderator,
          repeat: this.state.repeat,
          repeatToggle: this.repeatToggle,
          shufflePlaylist: this.shufflePlaylist
        }),
        React.createElement(init.components.channel.Playlist, {
          ref: "playlist",
          setItem: this.props.setItem,
          videoplayer: this.props.videoplayer,
          playItem: this.props.playItem,
          moderator: this.props.moderator,
          repeat: this.state.repeat
        })
      )
    );
  }
});
