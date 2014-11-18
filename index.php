<?php 
   if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == ''){
     $redirect = 'https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
     header("Location: $redirect");
   }
?>
<!DOCTYPE html>
<html>
  <head>
    <title>GRZB|SYNC</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="language" content="en" />
    <meta name="keywords" content="audio, video, videos, music, sync, grzb, synchronization, synchronized, watch, youtube, vimeo, together" />
    <meta name="description" content="A service to play media files synchronized between multiple clients" />
    <meta name="page-topic" content="music, video, multimedia" />
    <link href="javascript/video-js/video-js.css" rel="stylesheet" />
    <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/ui/1.11.2/jquery-ui.min.js"></script>
    <script type="text/javascript" src="javascript/video-js/video.dev.js"></script>
    <script type="text/javascript" src="javascript/peer.js"></script>
    <script type="text/javascript" src="javascript/page.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
  <body>
    <div id="wrapper">
    
      <div id="header">
        <div id="logo">
          <a href="https://sync.grzb.de/"><p id="grzb">GRZB</p><p id="sep">|</p><p id="synch">SYNC</p></a>
        </div>
      </div>
      
      <div id="systemmsg"></div>
      <div id="privacypolicy"></div>
      
      <div id="createchanneloverlay">
        <form method="post" id="createchannelform" autocomplete="off">
          Username [a-zA-Z0-9]<br />
          <input type="text" name="username" id="channelusername" pattern="[a-zA-Z0-9]{1,30}" maxlength="30" required /><br />
          Channel name:<br />
          <input type="text" name="channelname" id="channelname" required /><br />
          Maximum clients (min. 2):<br />
          <input type="text" name="maxclients" value="20" pattern="\d*" id="maxclients" /><br /><br />
          <label for="makeprivate">Make channel private</label>
          <input type="checkbox" name="makeprivate" id="makeprivate" />
          <div id="makeprivatediv">
            Password:<br />
            <input type="password" name="channelpassword" id="channelpassword" />
          </div>
          <input type="submit" value="Create channel" />
        </form>
      </div>
      
      <div id="joinchanneloverlay">
        <form method="post" id="joinchannelform" autocomplete="off">
          Username [a-zA-Z0-9]<br />
          <input type="text" name="username" id="username" pattern="[a-zA-Z0-9]{1,30}" maxlength="30" required /><br />
          <div id="password">
            Password:<br />
            <input type="password" name="channelpw" id="channelpw" /><br />
          </div>
          <input type="submit" value="Join channel" />
        </form>
      </div>
      
      <div id="content">
        <div id="channelcontrol">
          <div id="searchdiv">
            Search after name<br />
            <input type="text" id="search" />
          </div>
          <div id="sortafterdiv">
            Sort after<br />
            <select id="sortafter" size="1">
              <option>creation time</option>
              <option>name</option>
              <option>clients</option>
            </select>
          </div><br /><br />
          <label for="showfull">Show full channels</label>
          <input type="checkbox" id="showfull" checked="checked" /><br /><br />
          <label for="showprivate">Show private channels</label>
          <input type="checkbox" id="showprivate" checked="checked" />
        </div>
        <div id="description">
          GRZB|SYNC is a website where you watch and listen to media files together with your friends all over the world!
          You can add media files from various sources or with a direct link to the file.
          To get started just create a channel or register for free to unlock some additional features.
          <div id="createchannel">Create a channel</div>
        </div>
        <div class="clear"></div>
        <hr />
        <div id="channels"></div>
      </div>
      
      <div id="footer">
        <div id="legal">Legal Notice</div> · <a href="http://leafc.at"><div id="leafcatlogo"></div>Leafcat Coding</a> · <a href="https://github.com/Leafcat/sync">GitHub project page</a>
      </div>
      
    </div>
  </body>
</html>