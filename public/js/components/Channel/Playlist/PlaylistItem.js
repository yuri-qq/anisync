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
