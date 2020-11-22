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

init.components.index.ChannelControls = React.createClass({
  displayName: "ChannelControls",
  propTypes: {
    value: React.PropTypes.string.isRequired,
    search: React.PropTypes.func,
    showPrivate: React.PropTypes.func,
    privateCheckboxChange: React.PropTypes.func
  },

  render: function() {
    return(
      React.createElement("div", {id: "channelControls"},
        React.createElement("input", {
          type: "text",
          className: "search",
          placeholder: "search",
          value: this.props.value,
          onChange: this.props.search
        }),
        React.createElement("div", null,
          React.createElement("label", null,
            React.createElement("input", {
              type: "checkbox",
              className: "private",
              checked: this.props.showPrivate,
              onChange: this.props.privateCheckboxChange
            }),
            React.createElement("span", null, "show private channels")
          )
        )
      )
    );
  }
});
