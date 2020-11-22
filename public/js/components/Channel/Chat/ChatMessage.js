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

init.components.channel.ChatMessage = React.createClass({
  displayName: "ChatMessage",
  propTypes: {
    info: React.PropTypes.bool.isRequired,
    username: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired,
    time: React.PropTypes.string.isRequired,
    urls: React.PropTypes.arrayOf(React.PropTypes.shape({
      schema: React.PropTypes.string.isRequired,
      index: React.PropTypes.number.isRequired,
      lastIndex: React.PropTypes.number.isRequired,
      raw: React.PropTypes.string.isRequired,
      text: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired
    }))
  },

  render: function() {
    if(this.props.info) {
      return(
        React.createElement("div", {className: "message"},
          React.createElement("div", {className: "info"}, this.props.username + " " + this.props.text)
        )
      );
    }
    else {
      return(
        React.createElement("div", {className: "message"},
          React.createElement("div", {className: "header"},
            React.createElement("span", {className: "time"}, "[" + this.props.time + "]"),
            React.createElement("span", {className: "username"}, this.props.username + ":")
          ),
          React.createElement(init.components.lib.Linkify, {
            className: "text",
            urls: this.props.urls
          }, this.props.text)
        )
      );
    }
  }
});
