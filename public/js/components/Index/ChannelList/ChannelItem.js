var ChannelItem = React.createClass({
  displayName: "ChannelItem",

  render: function() {
    return(
      React.createElement("li", {className: "channel"},
        React.createElement("a", {href: "/channel/" + this.props.id},
          React.createElement("span", {className: "type "  + (this.props.private ? "private" : "public")},
            React.createElement("span", {className: "fa fa-lg " + (this.props.private ? "fa-lock" : "fa-unlock")})
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