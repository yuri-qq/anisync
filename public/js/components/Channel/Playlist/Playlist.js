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

init.components.channel.Playlist = React.createClass({
    displayName: "Playlist",
    propTypes: {
        playItem: React.PropTypes.func.isRequired,
        moderator: React.PropTypes.bool.isRequired,
        videoplayer: React.PropTypes.object.isRequired,
        repeat: React.PropTypes.bool.isRequired,
        setItem: React.PropTypes.func.isRequired
    },

    mixins: [SortableMixin],

    sortableOptions: {
        handle: ".drag",
        animation: 150
    },

    getInitialState: function() {
        return {
            items: []
        };
    },

    componentDidMount: function() {
        socket.on("playItem", this.playItem);
        socket.on("nextItem", this.nextItem);
        socket.on("shufflePlaylist", this.setPlaylist);
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
            var index = parseInt(event.currentTarget.parentNode.parentNode.dataset.index);
            socket.emit("removeItem", {id: event.currentTarget.parentNode.parentNode.id, index: index});
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
            this.props.setItem(null);
            this.props.videoplayer.reset();
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
            var index = parseInt(event.target.parentNode.parentNode.dataset.index);
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

        if(items.length === nextIndex) {
            if(this.props.repeat) {
                nextIndex = 0;
            }
            else {
                return;
            }
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

    shufflePlaylist: function() {
        if(this.props.moderator) {
            var items = this.state.items.shuffle();
            socket.emit("shufflePlaylist", items);
        }
    },

    setPlaylist: function(playlist) {
        this.setState({items: playlist});
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
                        React.createElement(init.components.channel.PlaylistItem, options)
                    );
                }, this)
            )
        );
    }
});
