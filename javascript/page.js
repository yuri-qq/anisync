//ur waifu is shit
$(function(){
  function scrollToAnchor(aid){
    var aTag = $("a[name='"+ aid +"']");
    $("html,body").animate({scrollTop: aTag.offset().top},"slow");
  } // scroll to a HTML anchor smoothly
  
  function sortByKey(array, key) {
    return array.sort(function(a, b) {
      var x = a[key];
      var y = b[key];

      if (typeof x == "string") {
        x = x.toLowerCase(); 
        y = y.toLowerCase();
      }
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
  
  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  } // if 2 arrays are equal
  
  function arraysKeyEqual(arrayA, arrayB, key) {
    var arrayAkey = new Array();
    var arrayBkey = new Array();
    var length = arrayA.length;    
    for (var i = 0; i < length; i++) {
      arrayAkey.push(arrayA[i][key]);
    }  
    var length = arrayB.length;    
    for (var i = 0; i < length; i++) {
      arrayBkey.push(arrayB[i][key]);
    }
    return arraysEqual(arrayAkey,arrayBkey);
  }
  
  function postAjax(url, data) {
    var ajax = $.ajax({
      url: url,
      type: "post",
      contentType: "application/x-www-form-urlencoded;charset=UTF-8",
      data: data
    });
    
    return ajax;
  } // make async ajax call
  
  $(".german").click(function(e) {
    e.preventDefault();
    scrollToAnchor("german");
  });
  
  $(".english").click(function(e) {
    e.preventDefault();
    scrollToAnchor("english");
  });
  
  $("#footer").on("click", "#legal", function(e){
    e.stopPropagation();
    $.ajax({url: "legal.html", dataType: "text", success: 
      function(data) {
        $("#privacypolicy").html(data);
        $("#privacypolicy").fadeIn();
      }
    });
  });
  
  $("#content").on("click", "#addmediainfo", function(e){
    e.stopPropagation();
    $("#addmediainfodiv").fadeIn();
  });
  
  $(document).on("click", "#addmediainfodiv", function(e){
    e.stopPropagation();
  });
  
  $("#joinchanneloverlay, #createchanneloverlay, #checkpassword, #privacypolicy").click(function(e) {
    e.stopPropagation();
  });
  
  $(document).click(function() {
    $("#joinchanneloverlay, #createchanneloverlay, #addmediainfodiv, #privacypolicy").fadeOut();
  });
  
  $("#createchannel").click(function(e) {
    $("#createchanneloverlay").fadeIn();
    e.stopPropagation();
  });
  
  $("#makeprivate").click(function() {
    if($("#makeprivatediv").css("visibility") === "hidden") {
      $("#makeprivatediv").css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0});
    }
    else {
      $("#makeprivatediv").css({opacity: 1.0, visibility: "hidden"}).animate({opacity: 0.0});
    }
  });
  
  $("#createchannelform").submit(function(e) {
    e.preventDefault();
    var form = $(this);
    var serializedData = form.serialize() + "&action=createChannel";
    var createchannel = postAjax("PHP/functions.php", serializedData);
    createchannel.done(function(response) {
      var channelid = JSON.parse(response);
      if(channelid !== false) {
        $("#createchanneloverlay").fadeOut();
        var username = $("#channelusername").val();
        var password = $("#channelpassword").val();
        var channeltitle = $("#channelname").val();
        if(password === "") {
          loadChannel(channelid, channeltitle, false, username);
        }
        else {
          loadChannel(channelid, channeltitle, password, username);
        }
      }
      else {
        $("#systemmsg").html("System message: This username is already in use.");
        $("#systemmsg").fadeIn().delay(3000).fadeOut();
      }
    });
    createchannel.fail(function(jqXHR, textStatus, errorThrown) {
      console.log("CREATE CHANNEL FAILED: " + errorThrown);
    });
  });
  
  var channels;
  var notinchannel = true;
  (function getChannels() {
    var getChannelsCall = postAjax("PHP/functions.php", "action=getChannels");
    getChannelsCall.done(function(response) {
      channels = JSON.parse(response);
      displayChannels();
    });
    getChannelsCall.fail(function(jqXHR, textStatus, errorThrown) {
      console.log("GET CHANNELS FAILED: " + errorThrown);
    });
    getChannelsCall.always(function() {
      if(notinchannel) {
        setTimeout(getChannels, 5000);
      }
    });
  }());
  
  function displayChannels() {
    if(channels && notinchannel) {
      var settings = {
        search: $("#search").val(),
        sort: $("#sortafter").val(),
        showfull: $("#showfull").is(":checked"),
        showprivate: $("#showprivate").is(":checked")
      };
      
      if(settings["sort"] === "creation time") {
        channels = sortByKey(channels, "id");
        channels.reverse();
      }
      else if(settings["sort"] === "name") {
        channels = sortByKey(channels, "name");
      }
      else {
        channels = sortByKey(channels, "name");
        channels.reverse();
        channels = sortByKey(channels, "clients");
        channels.reverse();
      }
      
      var channelshtml = "";
      var i;
      for (i = 0; i < channels.length; ++i) {
        if(settings["search"] === "" || channels[i]["name"].toLowerCase().indexOf(settings["search"].toLowerCase()) > -1) {
          if(settings["showprivate"] || channels[i]["private"] === 0) {
            if(settings["showfull"] || channels[i]["clients"] < channels[i]["maxclients"]) {
              var status;
              if(channels[i]["private"] === 1) {
                status = "<div class='private'>private</div>";
              }
              else {
                status = "<div class='public'>public</div>";
              }
              channelshtml = channelshtml + "<div class='channel " + channels[i]['id'] + "'>" + status + "<div class='channeltitle'>" + channels[i]['name'] + "</div><div class='clients'>" + channels[i]['clients'] + "/" + channels[i]['maxclients'] + "</div></div>";
            }
          }
        }
      }
      $("#channels").html("");
      $("#channels").html(channelshtml);
    }
  }
  
  $("#search").on("input", function() { 
    displayChannels();
  });
  
  $("#sortafter").on("change", function() { 
    displayChannels();
  });
  
  $("#showprivate").click(function() {
    displayChannels();
  });
  
  $("#showfull").click(function() {
    displayChannels();
  });

  $("#channels").on("click", ".channel", function(e) {
    if($("#joinchanneloverlay").css("display") === "none") {
      e.stopPropagation();
    }
    var channelid = $(this).attr("class").split(" ")[1];
    var channeltitle = $(this).children(".channeltitle").text();
    var channeltype = $(this).children().html();
    
    if(channeltype === "public") {
      $("#password").css({visibility: "hidden"});
    }
    else {
      $("#password").css({visibility: "visible"});
    }
    
    $("#joinchanneloverlay").fadeIn();
    
    $("#joinchannelform").submit(function(e) {
      e.preventDefault();
      
      var channelfree;
      var clients = $("." + channelid).children(".clients").html().split("/");
      if(clients[1] - clients[0] > 0) {
        channelfree = true;
      }
      else {
        $("#systemmsg").html("System message: The channel you are trying to join is full.");
        $("#systemmsg").fadeIn().delay(2000).fadeOut();
      }
      
      if(channelfree) {
        var username = $("#username").val();
        var password = $("#channelpw").val();
        var data = "username=" + username + "&password=" + password + "&channelID=" + channelid + "&action=validate";
        
        var validate = postAjax("PHP/functions.php", data);
        validate.done(function(response) {
          var joinchannel = JSON.parse(response);
          
          if(channeltype === "public") {
            if(joinchannel["username"]) {
              loadChannel(channelid, channeltitle, false, username);
            }
            else {
              $("#systemmsg").html("System message: This username is already in use.");
              $("#systemmsg").fadeIn().delay(3000).fadeOut();
            }
          }
          else {
            if(joinchannel["password"]) {
              if(joinchannel["username"]) {
                loadChannel(channelid, channeltitle, password, username);
              }
              else {
                $("#systemmsg").html("System message: This username is already in use.");
                $("#systemmsg").fadeIn().delay(3000).fadeOut();
              }
            }
            else {
              $("#systemmsg").html("System message: Wrong password.");
              $("#systemmsg").fadeIn().delay(3000).fadeOut();
            }
          }

        });
        validate.fail(function(jqXHR, textStatus, errorThrown) {
          console.log("FAILED TO VALIDATE CHANNELDATA", errorThrown);
        });
      }
    });
    
  });
  
  
  var peer;
  function loadChannel(channelid, channeltitle, password, username) {
    $("#joinchanneloverlay").fadeOut();
    notinchannel = false;
    $("#content").html("");
    $("#content").load("channel.html", function() {
      videojs("video", {"width": "100%", "height": "100%"}, function() {
        // --- on startup when video element is ready ---
        $(".vjs-fullscreen-control").after("<div id='enlargeplayer'></div>");
        var videoplayer = this;
        videoplayer.hide();
        
        $("#channeltitle").text(channeltitle);
        $("#mediaelements").sortable({handle: ".handle"});
        $("#mediaelements").on("sortupdate", finishedSorting);
        
        (function keepAlive() {
            var data = "channelID=" + channelid + "&action=keepalive";
            var keepalive = postAjax("PHP/functions.php", data);
            keepalive.always(function() {
              setTimeout(keepAlive, 5000);
            });
            keepalive.fail(function(jqXHR, textStatus, errorThrown) {
              console.log("FAILED TO KEEP CHANNEL ALIVE", errorThrown);
            });
        }());
        
        var conn = new Array();
        function connectPeers(peers) {
          var connections = new Array();
          var length = peers.length;    
          for (var i = 0; i < length; i++) {
            var singlePeer = peer.connect(peers[i]["peerid"])
            connections.push(singlePeer);
          }
          conn = connections;
          console.log("CONNECTED TO", connections);
        }
          
        var startup = true;
        function getPeers(peerid) {
          var data = "peerid=" + peerid + "&password=" + password + "&channelID=" + channelid + "&action=getpeers";
          var getpeers = postAjax("PHP/functions.php", data);
          getpeers.done(function(response) {
            var peers = JSON.parse(response);
            if(peers.length === 0) {
              startup = false;
            }
            connectPeers(peers);
          });
          
          getpeers.fail(function(jqXHR, textStatus, errorThrown) {
            console.log("FAILED TO GET PEERS", errorThrown);
          });
        }
        
        function setStartup(data) {
          mediaelements = data.playlist;
          var length = data.playlist.length;
          for(var i = 0; i < length; i++) {
            if(data.playlist[i]["playing"]) {
              videoplayer.one("loadedmetadata", function() {
                videoplayer.currentTime(data.currenttime);
                if(!data.paused) {
                  blocked = true;
                  videoplayer.play();
                }
              });
              videoplayer.show();
              blockload = true;
              videoplayer.src(data.playlist[i]["url"]);
              videoplayer.load();
              var playing = i;
            }
          }
          
          nextid = data.nextid;
          
          var length = mediaelements.length;
          for (var i = 0; i < length; i++) {
            $("#mediaelements").append("<li class='plelement " + mediaelements[i]['id'] + "'><div class='mediafileinfo'><span class='handle'>::</span></div><div class='removemediafile'>X</div><div class='mediafile'></div></li>");
            $("." + mediaelements[i]["id"]).children(".mediafile").text(mediaelements[i]["title"]);
          }
          $("#mediaelements").sortable("refresh");

          
          if(mediaelements.length) {
            $("." + mediaelements[playing]["id"]).css({"border-color": "#9ecaed", "box-shadow": "0 0 10px #9ecaed"});
          }
          $("#mediaelements").sortable("refresh");
          console.log("LOADED CHANNEL DATA");
        }
        
        function deletePeer(peerid) {
          var data = "peerid=" + peerid + "&channelID=" + channelid + "&password=" + password + "&action=deletepeer";
          var deletepeer = postAjax("PHP/functions.php", data);
          deletepeer.done(function() {
            console.log("DELETED PEER", peerid);
          });
          deletepeer.fail(function(jqXHR, textStatus, errorThrown) {
            console.log("FAILED TO DELETE PEER", errorThrown);
          });
        }
        
        // --- webRTC/PeerJS ---
        peer = new Peer(username, {host: "sync.rrerr.net", port: 443, secure: true});
        peer.on("open", function(id) {
          console.log("CREATED PEER", id);
          getPeers(id);
          var data = "peerid=" + id + "&channelID=" + channelid + "&password=" + password + "&action=newpeer";
          var newpeer = postAjax("PHP/functions.php", data);
          newpeer.fail(function(jqXHR, textStatus, errorThrown) {
            console.log("INSERTING NEW PEER FAILED", errorThrown);
          });
          updateChatusers();
        });

        peer.on("connection", function(receive) {
          receive.on("close", function() {
            console.log("PEER DISCONNECTED", receive.peer);
            var length = conn.length;
            for (var i = 0; i < length; i++) {
              if(conn[i]["peer"] === receive.peer) {
                conn.splice(i, 1);
              }
            }
            deletePeer(receive.peer);
            updateChatusers();
          });
          
          receive.on("data", function(data) {
            console.log("RECEIVING DATA", data);
            
            switch(data.action) {
              case "PLAY":
                blocked = true;
                videoplayer.play();
                break;
              case "PAUSE":
                blocked = true;
                videoplayer.currentTime(data.time);
                videoplayer.pause();
                break;
              case "SEEK":
                videoplayer.currentTime(data.time);
                break;
              case "ADDMEDIA":
                addMedia(data.videoobj);
                break;
              case "REMOVEMEDIA":
                removeMedia(data.removeid);
                break;
              case "PLAYMEDIA":
                playMedia(data.playid);
                break;
              case "PLAYLIST":
                updatePlaylist(data.order);
                break;
              case "READY":
                waitForLoaded();
                break;
              case "GETSTARTUP":
                var peerData = {
                  action: "SETSTARTUP",
                  nextid: nextid,
                  playlist: mediaelements,
                  currenttime: videoplayer.currentTime(),
                  paused: videoplayer.paused()
                };
                length = conn.length;
                for (var i = 0; i < length; i++) {
                  if(conn[i]["peer"] === receive["peer"]) {
                    console.log("SENDING CHANNEL DATA TO PEER", conn[i]["peer"]);
                    conn[i].send(peerData);
                  }
                }
                break;
              case "SETSTARTUP":
                setStartup(data);
                break;
              case "CHAT":
                data.user = receive.peer;
                receiveChat(data);
                break;
              case "UPDATESTATS":
                break;
            } // handle received data
          });
            
          receive.on("open", function() {
            var length = conn.length;
            var connectnew = false;
            if(length > 0) {
              for (var i = 0; i < length; i++) {
                if(conn[i]["peer"] === receive.peer) {
                  connectnew = true;
                }
              }
              if(connectnew === false) {
                newpeer = peer.connect(receive.peer);
                conn.push(newpeer);
              }
            }
            else {
              newpeer = peer.connect(receive.peer);
              conn.push(newpeer);
            }
            console.log("CONNECTED TO PEERS", conn);
            if(startup) {
              for (var i = 0; i < length; i++) {
                if(conn[i]["peer"] === receive["peer"]) {
                  startup = false;
                  console.log("GETTING CHANNEL DATA", conn[i], receive);
                  var peerData = {
                    action: "GETSTARTUP"
                  };
                  conn[i].send(peerData);
                }
              }
            }
            updateChatusers();
          });
        });
          
        peer.on("error", function(err) {
          switch(err.type) {
            case "browser-incompatible":
              console.log("FATAL ERROR", "browser-incompatible", "Your browser does not support some or all WebRTC features that you are trying to use.", err);
              break;
            case "disconnected":
              console.log("FATAL ERROR", "disconnected", "You've already disconnected this peer from the server and can no longer make any new connections on it.", err);
              break;
            case "invalid-id":
              console.log("FATAL ERROR", "invalid-id", "The ID passed into the Peer constructor contains illegal characters.", err);
              break;
            case "invalid-key":
              console.log("FATAL ERROR", "invalid-key", "The API key passed into the Peer constructor contains illegal characters or is not in the system.", err);
              break;
            case "network":
              console.log("FATAL ERROR", "network", "Lost or cannot establish a connection to the signalling server.", err);
              break;
            case "peer-unavailable":
              console.log("FATAL ERROR", "peer-unavailable", "The peer you\"re trying to connect to does not exist.", err);
              break;
            case "ssl-unavailable":
              console.log("FATAL ERROR", "ssl-unavailable", "PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.", err);
              break;
            case "server-error":
              console.log("FATAL ERROR", "server-error", "Unable to reach the server.", err);
              break;
            case "socket-error":
              console.log("FATAL ERROR", "socket-error", "An error in the underlying socket has occurred.", err);
              break;
            case "socket-closed":
              console.log("FATAL ERROR", "socket-closed", "The underlying socket closed unexpectedly.", err);
              break;
            case "unavailable-id":
              console.log("FATAL ERROR", "unavailable-id", "The ID passed into the Peer constructor is already taken.", err);
              break;
            case "webrtc":
              console.log("FATAL ERROR", "webrtc", "Native WebRTC error.", err);
              break;
            default:
              console.log("FATAL ERROR", "unknown", "An unknown error has occurred.", err);
              break;
          } 
        }); // print WebRTC errors to console
        
        function sendData(peerData) {
          var length = conn.length;
          for (var i = 0; i < length; i++) {
            conn[i].send(peerData);
          }
        } // send data to all connected users
        
        // --- video player controls
        var blocked = false;
        videoplayer.on("play", function() {
          if(!blocked) {
            var peerData = {
              action: "PLAY"
            }
            sendData(peerData);
          }
          else {
            blocked = false;
          }
        });
        
        videoplayer.on("pause", function() {
          if(!blocked) {
            var peerData = {
              action: "PAUSE",
              time: videoplayer.currentTime()
            }
            sendData(peerData);
          }
          else {
            blocked = false;
          }
        });
        
        videoplayer.on("clickedProgressbar", function() {
          var peerData = {
            action: "SEEK",
            time: videoplayer.currentTime()
          }
          sendData(peerData);
        }); // listen for click on progress bar. See line 5200 in video.dev.js
    
        var enlarged = false
        $("#content").on("click", "#enlargeplayer", function() {
          if(enlarged) {
            $("#videowrapper").animate({"width": "50%"}, 500);
            $(this).css("background-image", "url(./images/maximize.png)");
            enlarged = false;
          }
          else {
            $("#videowrapper").animate({"width": "100%"}, 500);
            $(this).css("background-image", "url(./images/minimize.png)");;
            enlarged = true;
          }
        });
        
        // --- playlist ---
        var videoReady = 0;
        var mediaelements = new Array();
        var nextid = 0;

        $("#content").on("keyup", "#medialink", function(e) {
          if(e.keyCode == "13") {
            addMediaClick();
          }
        });  
        
        $("#content").on("click", "#addmedia", function() {
          addMediaClick();
        });
        
        function addMediaClick() {
          var url = $("#medialink").val();
          if(url.indexOf("http://") > -1 || url.indexOf("https://") > -1) {
            var direct = true;
            
            switch(true) { // if url is any of these sites, grab source with PHP script
              case(url.indexOf("youtube.com") > -1):
              case(url.indexOf("vimeo.com") > -1):
              case(url.indexOf("nicovideo.jp") > -1):
              case(url.indexOf("soundcloud.com") > -1):
              case(url.indexOf("bandcamp.com") > -1):
                direct = false;
            }
            
            if(direct) {
              var videoobj = {title: decodeURIComponent(url), url: url};
              var peerData = {
                action: "ADDMEDIA",
                videoobj: videoobj
              }
              sendData(peerData);
              addMedia(videoobj);
            }
            else {
              var data = "url=" + url + "&action=geturl";
              var geturl = postAjax("PHP/functions.php", data);
              geturl.done(function(response) {
                var videodata = JSON.parse(response);
                if(videodata === "invalid") {
                  $("#systemmsg").html("System message: This media link is invalid.");
                  $("#systemmsg").fadeIn().delay(3000).fadeOut();                
                }
                else if(videodata === "notexist") {
                  $("#systemmsg").html("System message: This video does not exist.");
                  $("#systemmsg").fadeIn().delay(3000).fadeOut();  
                }
                else {
                  var videoobj = {title: decodeURIComponent(videodata["title"]).replace(/&amp;/g, '&'), url: videodata["url"]}; // replace &amp; with & manually since url decode doesn't decode it
                  var peerData = {
                    action: "ADDMEDIA",
                    videoobj: videoobj
                  }
                  sendData(peerData);
                  addMedia(videoobj);
                }
              });
              geturl.fail(function(jqXHR, textStatus, errorThrown) {
                console.log("FAILED TO VIDEO URL", errorThrown);
              });
            }
          }
          else {
            $("#systemmsg").html("System message: Please enter a valid URL.");
            $("#systemmsg").fadeIn().delay(3000).fadeOut();    
          }
          $("#medialink").val("");
        }
        
        $("#content").on("click", ".removemediafile", function() {
          var removeid = parseInt($(this).parent().attr("class").split(" ")[1], 10);
          var peerData = {
            action: "REMOVEMEDIA",
            removeid: removeid
          }
          sendData(peerData);
          removeMedia(removeid);
        });
          
        $("#content").on("click", ".mediafile, .mediafileinfo", function() {
          var playid = parseInt($(this).parent().attr("class").split(" ")[1], 10);
          var peerData = {
            action: "PLAYMEDIA",
            playid: playid
          }
          sendData(peerData);
          playMedia(playid);
        });
          
        videoplayer.on("ended", function(){
          nextMedia();
        });

        videoplayer.on("error", function(){
          $("#systemmsg").html("System message: An error occurred with the current media source. The playback has stopped.");
          $("#systemmsg").fadeIn().delay(3000).fadeOut();    
        });
          
        var blockload = false;
        videoplayer.on("loadeddata", function(){
          if(!blockload) {
            console.log("READY");
            var peerData = {
              action: "READY"
            }
            sendData(peerData);
            waitForLoaded();
          }
          else {
            blockload = false;
          }
        });
          
        function addMedia(videoobj) {
          $("#mediaelements").append("<li class='plelement " + nextid + "'><div class='mediafileinfo'><span class='handle'>::</span></div><div class='removemediafile'>X</div><div class='mediafile'></div></li>");
          $("." + nextid).children(".mediafile").text(videoobj["title"]);
          if(mediaelements.length === 0) {
            videoplayer.src(videoobj["url"]);
            mediaelements.push({id: nextid, title: videoobj["title"], url: videoobj["url"], playing: true});
            $(".plelement").first().css({"border-color": "#9ecaed", "box-shadow": "0 0 10px #9ecaed"});
            videoplayer.show();
          }
          else {
            mediaelements.push({id: nextid, title: videoobj["title"], url: videoobj["url"], playing: false});
          }
          nextid = nextid + 1;
          $("#mediaelements").sortable("refresh");
        }
        
        function removeMedia(id) {
          var length = mediaelements.length;
          for (var i = 0; i < length; i++) {
            if(mediaelements[i]["id"] === id) {
              var arraykey = i;
              if(mediaelements[i]["playing"] && mediaelements.length > 1) {
                nextMedia();
              }
              else if(mediaelements.length === 1) {
                blocked = true;
                videoplayer.pause();
                videoplayer.hide();
              }
            }
          }
          mediaelements.splice(arraykey, 1);
          $("." + id).remove();
          $("#mediaelements").sortable("refresh");
        }
        
        function nextMedia() {
          var length = mediaelements.length;
          for(var i = 0; i < length; i++) {
            if(mediaelements[i]["playing"]) {
              mediaelements[i]["playing"] = false;
              $("." + mediaelements[i]["id"]).css({"border-color": "#B8B8B8", "box-shadow": "none"});
              play = i + 1;
            }
          }
          if(play >= mediaelements.length) {
            play = 0;
          }
          mediaelements[play]["playing"] = true;
          $("." + mediaelements[play]["id"]).css({"border-color": "#9ecaed", "box-shadow": "0 0 10px #9ecaed"});
          videoplayer.currentTime(0);
          videoplayer.src(mediaelements[play]["url"]);
          videoReady = 0;
        }

        function playMedia(id) {
          var length = mediaelements.length;
          for(var i = 0; i < length; i++) {
            if(mediaelements[i]["id"] === id && mediaelements[i]["playing"] === false) {
              for(var i2 = 0; i2 < length; i2++) {
                mediaelements[i2]["playing"] = false;
                $("." + mediaelements[i2]["id"]).css({"border-color": "#B8B8B8", "box-shadow": "none"});
              }
              mediaelements[i]["playing"] = true;
              $("." + mediaelements[i]["id"]).css({"border-color": "#9ecaed", "box-shadow": "0 0 10px #9ecaed"});
              videoplayer.currentTime(0);
              videoplayer.src(mediaelements[i]["url"]);
              videoReady = 0;
            }
          }
        }
    
        function waitForLoaded() {
          videoReady = videoReady + 1;
          if(videoReady === conn.length + 1 && videoplayer.paused()) {
            console.log("VIDEO READY", "PLAYING");
            blocked = true;
            videoplayer.play();
          }
        }
        
        function updatePlaylist(order) {
          var newHTML = "";
          var newOrder = new Array();
          var length = order.length;
          for (var i = 0; i < length; i++) {
            for (var i2 = 0; i2 < length; i2++) {
              if(order[i] === mediaelements[i2]["id"]) {
                newOrder.push(mediaelements[i2]);
                newHTML = newHTML + $("." +  mediaelements[i2]["id"])[0].outerHTML;
              }
            }
          }
          mediaelements = newOrder;
          $("#mediaelements").html(newHTML);
          $("#mediaelements").sortable("refresh");
        }

        function finishedSorting() {
          var sortableArray = $("#mediaelements").sortable("toArray", {attribute: "class"});
          var idArray = new Array();
          var length = sortableArray.length;
          for(var i = 0; i < length; i++) {
            var newId = parseInt(sortableArray[i].split(" ")[1], 10);
            idArray.push(newId);
          }

          var peerData = {
            action: "PLAYLIST",
            order: idArray
          }
          sendData(peerData);
          
          var newOrder = new Array();
          var length = idArray.length;
          for (var i = 0; i < length; i++) {
            for (var i2 = 0; i2 < length; i2++) {
              if(idArray[i] === mediaelements[i2]["id"]) {
                newOrder.push(mediaelements[i2]);
              }
            }
          }
          mediaelements = newOrder;
        }
        
        // --- chat stuff ---
        $("#content").on("click", "#chatsend", function() {
          sendChat();
        });
        
        $("#content").on("keyup", "#chatinput", function(e) {
          if(e.keyCode == "13") {
            sendChat();
          }
        });
        
        function updateChatusers() {
          var usershtml = "<div class='chatuser " + peer["id"] + "'>" + peer["id"] + "</div>";
          var length = conn.length;
          for (var i = 0; i < length; i++) {
            usershtml = usershtml + "<div class='chatuser " + conn[i]["peer"] + "'>" + conn[i]["peer"] + "</div>";
          }
          $("#chatusers").html(usershtml);
        }
        
        function sendChat() {
          var text = $("#chatinput").val();
          if(text !== "") {
            var username = peer["id"];
          
            $("#chatbox").append("<div class='username'></div><div class='chattext'></div><br />");
            $(".username").last().text(username + ":");
            $(".chattext").last().text(text);
            $("#chatboxwrapper").scrollTop($("#chatbox")[0].scrollHeight);
            var peerData = {
              action: "CHAT",
              text: text
            }
            sendData(peerData);
            $("#chatinput").val("");
          }
        }
        
        function receiveChat(data) {
          var username = data.user;
          
          $("#chatbox").append("<div class='username'></div><div class='chattext'></div><br />");
          $(".username").last().text(username + ":");
          $(".chattext").last().text(data.text);
          $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
        }
        
        // --- statistics ---
        (function pushStats() {
          var buffered = Math.round(videoplayer.bufferedPercent() * 100); // percentage of buffered video data
          var minutes = Math.floor(videoplayer.currentTime() / 60); // get full minutes
          var seconds = ("0" + Math.floor(videoplayer.currentTime()) % 60).slice(-2); // get rest and convert to 2 digit string (using Math.floor here to not end up with 2:60 or some shit)
          var time = minutes + ":" + seconds; // create time string var
          
          var peerData = {
            action: "UPDATESTATS",
            buffered: buffered,
            time: time
          }
          sendData(peerData); //send stats to every user
          
          setTimeout(pushStats, 1000); // call every second
        })(); //invoke function immediately
        
      });
    });
  }
});