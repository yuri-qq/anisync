var PlaylistItem = React.createClass({
  displayName: "PlaylistItem",

  render: function() {
    return(
      React.createElement("li", {id: this.props.playlistItem.id, className: this.props.className, "data-index": this.props.index},
        React.createElement("div", {className: "drag"}, "☰"),
        React.createElement("div", {className: "remove", onClick: this.props.onRemoveItem},
          React.createElement("span", {className: "fa fa-lg fa-times"})
        ),
        React.createElement("div", {className: "la-ball-clip-rotate la-dark " + (this.props.refreshing ? "" : "hidden")},
          React.createElement("div", null)
        ),
        React.createElement("div", {className: "title", onClick: this.props.clickedItem}, this.props.playlistItem.title)
      )
    );
  }
});