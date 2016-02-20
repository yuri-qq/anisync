var ChannelControls = React.createClass({
  displayName: "ChannelControls",

  render: function() {
    return(
      React.createElement("div", {id: "channelControls"},
        React.createElement("input", {type: "text", className: "search", placeholder: "search", value: this.props.value, onChange: this.props.search}),
        React.createElement("div", null,
          React.createElement("label", null,
            React.createElement("input", {type: "checkbox", className: "private", checked: this.props.showPrivate, onChange: this.props.privateCheckboxChange}),
            React.createElement("span", null, "show private channels")
          )
        )
      )
    );
  }
});