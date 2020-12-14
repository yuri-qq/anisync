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

init.components.channel.PlaylistButton = React.createClass({
    displayName: "PlaylistButton",
    propTypes: {
        repeat: React.PropTypes.bool.isRequired,
        repeatToggle: React.PropTypes.func.isRequired,
        shufflePlaylist: React.PropTypes.func.isRequired
    },

    render: function() {
        return(
            React.createElement("div", {id: "playlist-button"},
                React.createElement("div", null,
                    React.createElement("div", null, "repeat:"),
                    React.createElement("div", {className: "icon repeat " + (this.props.repeat ? "activated" : ""), onClick: this.props.repeatToggle},
                        React.createElement("span", {className: "fa fa-2x fa-repeat"})
                    )
                ),
                React.createElement("div", null,
                    React.createElement("div", null, "shuffle:"),
                    React.createElement("div", {className: "icon random", onClick: this.props.shufflePlaylist},
                        React.createElement("span", {className: "fa fa-2x fa-random"})
                    )
                )
            )
        );
    }
});
