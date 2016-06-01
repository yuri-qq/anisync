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
