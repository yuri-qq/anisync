var VideoApp = React.createClass({
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