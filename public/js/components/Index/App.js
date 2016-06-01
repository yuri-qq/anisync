init.components.index.App = React.createClass({
  displayName: "App",

  render: function() {
    return(
      React.createElement("div", null,
        React.createElement(init.components.index.Controls, null),
        React.createElement(init.components.index.ChannelListApp, null)
      )
    );
  }
});
