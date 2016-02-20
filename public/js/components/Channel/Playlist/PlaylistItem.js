var PlaylistItem = React.createClass({
  displayName: "PlaylistItem",

  render: function() {
    return(
      React.createElement("li", {id: this.props.playlistItem.id, className: this.props.className, "data-index": this.props.index},
        React.createElement("div", {className: "drag"}, "☰"),
        React.createElement("div", {className: "remove", onClick: this.props.onRemoveItem}, "x"),
        React.createElement("div", {className: "title", onClick: this.props.clickedItem}, this.props.playlistItem.title)
      )
    );
  }
});