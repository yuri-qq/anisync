window.onload = function() {
  if(init.load) {
    socket = io.connect("/" + init.load);
    socket.on("redirect", function(url) {
      if(!url) return false;
      window.location = url;
    });

    ReactDOM.render(React.createElement(init.components[init.load].App), document.getElementById("app-mount"));
  }
}
