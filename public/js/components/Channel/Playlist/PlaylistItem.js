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

init.components.channel.PlaylistItem = React.createClass({
    displayName: "PlaylistItem",
    propTypes: {
        playlistItem: React.PropTypes.element.isRequired,
        className: React.PropTypes.string.isRequired,
        index: React.PropTypes.number.isRequired,
        refreshing: React.PropTypes.bool.isRequired,
        clickedItem: React.PropTypes.func.isRequired,
        onRemoveItem: React.PropTypes.func.isRequired
    },

    render: function() {
        return(
            React.createElement("li", {
                id: this.props.playlistItem.id,
                className: this.props.className,
                "data-index": this.props.index
            },
            React.createElement("div", {className: "wrapper"},
                React.createElement("div", {className: "drag"}, "☰"),
                React.createElement("div", {className: "la-ball-clip-rotate la-dark " + (this.props.refreshing ? "" : "hidden")},
                    React.createElement("div", null)
                ),
                React.createElement("div", {className: "title", onClick: this.props.clickedItem}, this.props.playlistItem.title),
                React.createElement("a", {className: "icon", href: this.props.playlistItem.webpage, target: "_blank"},
                    React.createElement("span", {className: "fa fa-lg fa-external-link"})
                ),
                React.createElement("a", {className: "icon", href: this.props.playlistItem.formats[0].src, download: "download", target: "_blank"},
                    React.createElement("span", {className: "fa fa-lg fa-download"})
                ),
                React.createElement("div", {className: "remove", onClick: this.props.onRemoveItem},
                    React.createElement("span", {className: "fa fa-lg fa-times"})
                )
            )
            )
        );
    }
});
