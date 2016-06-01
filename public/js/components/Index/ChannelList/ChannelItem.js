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
