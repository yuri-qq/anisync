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

init.components.index.ChannelItem = React.createClass({
    displayName: "ChannelItem",
    propTypes: {
        id: React.PropTypes.string,
        secured: React.PropTypes.bool,
        name: React.PropTypes.string,
        usercount: React.PropTypes.number
    },

    render: function() {
        return(
            React.createElement("li", {className: "channel"},
                React.createElement("a", {href: "/channel/" + this.props.id},
                    React.createElement("span", {className: "type "  + (this.props.secured ? "secured" : "public")},
                        React.createElement("span", {className: "fa fa-lg " + (this.props.secured ? "fa-lock" : "fa-unlock")})
                    ),
                    React.createElement("span", {className: "name"}, this.props.name),
                    React.createElement("span", {className: "usercount"}, 
                        React.createElement("span", {className: "fa fa-user" + (this.props.usercount - 1 ? "s" : "")}),
                        React.createElement("span", null, this.props.usercount)
                    )
                )
            )
        );
    }
});
