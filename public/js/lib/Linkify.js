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

init.components.lib.Linkify = React.createClass({
  displayName: "Linkify",
  propTypes: {
    urls: React.PropTypes.string.isRequired,
    children: React.PropTypes.node
  },

  linkify: function(text) {
    var urls = this.props.urls;

    if(!urls) return [React.createElement("span", null, text)];

    var elements = [];
    for(var i = 0; i < urls.length; i += 1) {
      var before = text.slice(i ? urls[i - 1].lastIndex : 0, urls[i].index);
      if(before) elements.push(React.createElement("span", null, before));

      elements.push(React.createElement("a", {href: urls[i].url, target: "_blank"}, urls[i].text));

      var after = text.slice(urls[i].lastIndex, text.length)
      if(after && i == urls.length - 1) elements.push(React.createElement("span", null, after));
    }

    return elements;
  },

  render: function() {
    return(
      React.createElement("div", null,
        this.linkify(this.props.children).map(function(element) {
          return element;
        })
      )
    );
  }
});
