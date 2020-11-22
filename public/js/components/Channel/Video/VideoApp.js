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

init.components.channel.VideoApp = React.createClass({
  displayName: "VideoApp",

  componentDidMount: function() {
    var wrapper = document.createElement("div");
    wrapper.innerHTML = "<video id='video' class='video-js vjs-16-9 vjs-default-skin' controls='controls' preload='auto'></video>";
    var video = wrapper.firstChild;
    this.refs.video.appendChild(video);
  },

  contextMenu: function(event) {
    event.preventDefault();
  },

  render: function() {
    return (
      React.createElement("div", {id: "video-app", ref: "video", onContextMenu: this.contextMenu})
    );
  }
});
