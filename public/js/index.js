window.onload = function() {
  var socket = io.connect("/index");

  var usernameInput = document.getElementById("username");
  usernameInput.addEventListener("keyup", function(event) {
    if(event.keyCode == 13 && usernameInput.value != "") {
      socket.emit("setUsername", usernameInput.value);
    }
  });

  var usernameButton = document.getElementsByClassName("button")[0];
  usernameButton.addEventListener("click", function() {
    if(usernameInput.value != "") {
      socket.emit("setUsername", usernameInput.value);
    }
  });
  
  ReactDOM.render(React.createElement(App), document.getElementById("app-mount"));
}