var Playlist = React.createClass({
  displayName: "Playlist",

  mixins: [SortableMixin],

  sortableOptions: {
    handle: ".drag",
    animation: 150
  },

  getInitialState: function() {
    return {items: []};
  },

  componentDidMount: function() {
    socket.on("playItem", this.playItem);
    socket.on("nextItem", this.nextItem);
  },

  addItems: function(data) {
    var items = this.state.items.concat(data);
    var previousState = this.state.items.length;
    if(previousState == 0) items[0].selected = true;
    this.setState({items: items}, function() {
      if(previousState == 0) this.props.playItem(0);
    });
  },

  onRemoveItem: function(event) {
    if(this.props.moderator) {
      var index = parseInt(event.currentTarget.parentNode.dataset.index);
      socket.emit("removeItem", {id: event.currentTarget.parentNode.id, index: index});
      this.removeItem(index);
    }
  },

  removeItem: function(removeIndex) {
    var items = this.state.items.filter(function(_, index) { return index !== removeIndex });
    var selected = this.selected();

    if(removeIndex < selected) {
      items[selected - 1].selected = true;
    }
    else if(selected == items.length && items.length > 0) {
      items[0].selected = true;
      this.setState({items: items}, function() {
        this.props.playItem(0);
      });
    }
    else if(items.length == 0) {
      videoplayer.reset();
    }
    else if(removeIndex == selected) {
      items[selected].selected = true;
      this.setState({items: items}, function() {
        this.props.playItem(selected);
      });
    }

    this.setState({items: items});
  },

  moveItem: function(oldIndex, newIndex) {
    var items = this.state.items.slice();
    items.splice(newIndex, 0, items.splice(oldIndex, 1)[0]);

    this.setState({items: items});
  },

  clickedItem: function(event) {
    if(this.props.moderator) {
      var index = parseInt(event.target.parentNode.dataset.index);
      socket.emit("playItem", index);
      this.playItem(index);
    }
  },

  playItem: function(index) {
    var items = this.state.items.slice();
    items[this.selected()].selected = false;
    items[index].selected = true;
    this.setState({items: items}, function() {
      this.props.playItem(index);
    });
  },

  nextItem: function() {
    var items = this.state.items.slice();
    var selected = this.selected();
    var nextIndex = selected + 1;

    if(items.length <= nextIndex) {
      nextIndex = 0;
    }

    items[selected].selected = false;
    items[nextIndex].selected = true;
    this.setState({items: items}, function() {
      this.props.playItem(nextIndex);
    });
  },

  handleEnd: function(event) {
    if(this.props.moderator) {
      socket.emit("moveItem", {oldIndex: event.oldIndex, newIndex: event.newIndex});
    }
  },

  selected: function() {
    for(var i = 0; i < this.state.items.length; i += 1) {
      if(this.state.items[i]['selected'] === true) {
        return i;
      }
    }
  },

  render: function() {
    return(
      React.createElement("ul", {id: "playlist"},
        this.state.items.map(function(playlistItem, index) {
          var options = {
            key: playlistItem.id,
            playlistItem: playlistItem,
            onRemoveItem: (playlistItem.refreshing ? false : this.onRemoveItem),
            clickedItem: (playlistItem.refreshing ? false : this.clickedItem),
            index: index,
            refreshing: playlistItem.refreshing,
            className: (playlistItem.selected ? "selected " : "") + (playlistItem.refreshing ? "refreshing " : "") + (playlistItem.error ? "error" : "")
          }

          return(
            React.createElement(PlaylistItem, options)
          );
        }, this)
      )
    );
  }
});
