<?php
  if($_POST['action'] == 'logout') {
    require_once('classes/Login.php');
    $login = new Login();
    $login->doLogout();
    if ($login->messages) {
      foreach ($login->messages as $message) {
        echo $message;
      }
    }
  }
  
  if($_POST['action'] == 'login') {
    require_once("config/db.php");
    require_once('classes/Login.php');
    $login = new Login();
    
    if($login->errors) {
      foreach ($login->errors as $error) {
        echo $error;
      }
    }
    if($login->messages) {
      foreach ($login->messages as $message) {
        echo $message;
      }
    }
  }
  
  if($_POST['action'] == 'register') {
    require_once("config/db.php");
    require_once('classes/Registration.php');
    $registration = new Registration();

    print(json_encode($registration->errors));
  }
  
  if($_POST['action'] == 'getChannels') {
    require_once("config/db.php");
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $stmt = $db->prepare("SELECT * FROM channels ORDER BY id DESC");
    $stmt->execute();
    $stmt->bind_result($id, $channelname, $private, $pwhash, $clients, $maxclients, $keepalive);
    $i = 0;
    $channels = array();
    $delete = array();
    $updatekeepalive = time();
    while($stmt->fetch()) {
      if($updatekeepalive - $keepalive < 10) {
        $channels[$i]['id'] = $id;
        $channels[$i]['name'] = $channelname;
        $channels[$i]['private'] = $private;
        $channels[$i]['clients'] = $clients;
        $channels[$i]['maxclients'] = $maxclients;
        $i = $i + 1;
      }
      else {
        $delete[] = $id;
      }
    }
    foreach($delete AS $deleteid) {
      $stmt = $db->prepare("DELETE FROM channels WHERE id= ? LIMIT 1");
      $stmt->bind_param('i',  $deleteid);
      $stmt->execute();
          
      $stmt = $db->prepare("DROP TABLE IF EXISTS channel". $deleteid);
      $stmt->execute();
    } 
    $stmt->close();
    
    print(json_encode($channels));
  }
  
  if($_POST['action'] == 'checkpass') {
    require_once("config/db.php");
    
    $channelID = $_POST['channelID'];
    $password = $_POST['password'];
    
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $stmt = $db->prepare("SELECT pwhash FROM channels WHERE id=?");
    $stmt->bind_param('i', $channelID);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($pwhash);
    while($stmt->fetch()) {
      if(password_verify($password, $pwhash)) {
        echo 'right';
      }
      else {
        echo 'false';
      }
    }
  }
  
  if($_POST['action'] == 'createChannel') {
    require_once("config/db.php");
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $stmt = $db->prepare("SELECT id FROM channels ORDER BY id DESC LIMIT 1");
    $stmt->execute();
    $stmt->bind_result($id);
    
    $nextid = 1;
    while($stmt->fetch()) {
      $nextid = $id + 1;
    }
    $channelname = htmlentities($_POST['channelname']);
    $maxclients = htmlentities($_POST['maxclients']);
    if(ctype_digit($maxclients)) {
      if($maxclients == "0" OR $maxclients == "1") {
        $maxclients = "2";
      }
      
      if($_POST['makeprivate']) {
        $makeprivate = 1;
        $pwhash = password_hash($_POST['channelpassword'], PASSWORD_DEFAULT);
      }
      else {
        $makeprivate = 0;
        $pwhash = 0;
      }
      $clients = 0;
      $currenttime = time();
      
      $stmt = $db->prepare("INSERT INTO channels (id, channelname, private, pwhash, clients, maxclients, keepalive) VALUES(?, ?, ?, ?, ?, ?, ?)");
      $stmt->bind_param("isisiii", $nextid, $channelname, $makeprivate, $pwhash, $clients, $maxclients, $currenttime);
      $stmt->execute();
      
      $channel = "channel".$nextid;
      $stmt = $db->prepare("CREATE TABLE IF NOT EXISTS $channel (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, peerid TEXT)");
      $stmt->execute();
      
      $stmt->close();
      
      echo $nextid;
    }
  }
  
  if($_POST['action'] == 'newpeer') {
    require_once("config/db.php");
    
    $peerid = $_POST['peerid'];
    $channelID = $_POST['channelID'];
    $password = $_POST['password'];
    if(is_numeric($channelID)) {
      $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
      
      $stmt = $db->prepare("SELECT pwhash FROM channels WHERE id=?");
      $stmt->bind_param('i', $channelID);
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($pwhash);
      while($stmt->fetch()) {
        if($pwhash) {
          if(password_verify($password, $pwhash)) {
            $pwright = true;
          }
          else {
            $pwright = false;
          }
        }
        else {
          $pwright = true;
        }
      }
      
      if($pwright) {
        $stmt = $db->prepare("INSERT INTO channel".$channelID."(peerid) VALUES(?)");
        $stmt->bind_param('si', $peerid);
        $stmt->execute();
        $stmt->close();
      }
    }
  }
  
  if($_POST['action'] == 'getpeers') {
    require_once("config/db.php");
    
    $clientpeerid = $_POST['peerid'];
    $channelID = $_POST['channelID'];
    $password = $_POST['password'];
    
    if(is_numeric($channelID)) {
      $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
      
      $stmt = $db->prepare("SELECT pwhash FROM channels WHERE id=?");
      $stmt->bind_param('i', $channelID);
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($pwhash);
      while($stmt->fetch()) {
        if($pwhash) {
          if(password_verify($password, $pwhash)) {
            $pwright = true;
          }
          else {
            $pwright = false;
          }
        }
        else {
          $pwright = true;
        }
      }
      
      if($pwright) {
        $stmt = $db->prepare("SELECT clients, maxclients FROM channels WHERE id=?");
        $stmt->bind_param('i', $channelID);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($clients, $maxclients);
        while($stmt->fetch()) {
          if($clients < $maxclients) {
            $canjoin = true;
          }
          else {
            $canjoin = false;
          }
        }
        
        if($canjoin) {
          $stmt = $db->prepare("INSERT INTO channel".$channelID." (peerid) VALUES(?)");
          $stmt->bind_param('s', $clientpeerid);
          $stmt->execute();
          
          $stmt = $db->prepare("SELECT * FROM channel".$channelID." WHERE peerid !=?");
          $stmt->bind_param('s', $clientpeerid);
          $stmt->execute();
          $stmt->store_result();
          $stmt->bind_result($id, $peerid);
          
          $connections = array();
          while($stmt->fetch()) {
            $connections[] = array(
              'id' => $id,
              'peerid' => $peerid
            );
          }
          $json_con = json_encode($connections);
          echo $json_con;
        }
      }
      
      $stmt->close();
    }
  }
  
  if($_POST['action'] == 'keepalive') {
    require_once("config/db.php");
     
    $channelID = $_POST['channelID'];
    $updatekeepalive = time();
    if(is_numeric($channelID)) {
      $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
      
      $stmt = $db->prepare("SELECT * FROM channel".$channelID);
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($id, $peerid);
      $clients = $stmt->num_rows;

      $stmt = $db->prepare("UPDATE channels SET keepalive =?, clients=? WHERE id =?");
      $stmt->bind_param('iii', $updatekeepalive, $clients, $channelID);
      $stmt->execute();
      
      $stmt->close();
    }
  }
  
  if($_POST['action'] == 'deletepeer') {
    require_once("config/db.php");
    
    $clientpeerid = $_POST['peerid'];
    $channelID = $_POST['channelID'];
    $password = $_POST['password'];
    if(is_numeric($channelID)) {
      $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

      $stmt = $db->prepare("SELECT pwhash FROM channels WHERE id=?");
      $stmt->bind_param('i', $channelID);
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($pwhash);
      while($stmt->fetch()) {
        if($pwhash) {
          if(password_verify($password, $pwhash)) {
            $pwright = true;
          }
          else {
            $pwright = false;
          }
        }
        else {
          $pwright = true;
          
        }
      }
      
      if($pwright) {
        $stmt = $db->prepare("DELETE FROM channel".$channelID." WHERE peerid =? LIMIT 1");
        $stmt->bind_param('s', $clientpeerid);
        $stmt->execute();
      }
      
      $stmt->close();
    }
  }
  
  if($_POST['action'] == 'updateusername') {
    require_once("config/db.php");
    require_once('classes/Login.php');
    $login = new Login();
    
    $clientpeerid = $_POST['peerid'];
    
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if($login->isUserLoggedIn()) {
      $stmt = $db->prepare("UPDATE users SET current_peer=? WHERE user_name=?");
      $stmt->bind_param('ss', $clientpeerid, $_SESSION['user_name']);
      $stmt->execute();
    }
    else {
      $stmt = $db->prepare("UPDATE users SET current_peer='' WHERE current_peer=?");
      $stmt->bind_param('s', $clientpeerid);
      $stmt->execute();
    }
    $stmt->close();
  }
  
  if($_POST['action'] == 'displayusername') {
    require_once("config/db.php");
    
    $peerids = json_decode($_POST['peerids']);
    $usernames = array();
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    foreach($peerids AS $peerid) {
      $stmt = $db->prepare("SELECT user_name FROM users WHERE current_peer=?");
      $stmt->bind_param('s', $peerid);
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($username);
      while($stmt->fetch()) {
        $usernames[] = array("peerid" => $peerid, "username" => $username);
      }
    }
    $stmt->close();
    
    echo json_encode($usernames);
  }
  
  if($_POST['action'] == 'geturl') {
    $url = $_POST['url'];
    $videoobj = grabSource($url);
    echo json_encode($videoobj);
  }
  
  function curl_download($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_REFERER, "http://examplepage.com/test.html");
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0");
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
  }
  
  function grabSource($url) {
    if(strpos($url, 'youtube.com') !== false) {
    
      $videosite = @file_get_contents($url);
      if($videosite !== false) {
        preg_match_all('/og:title" content="(.*)">/', $videosite, $titlematch);
        $videoobj['title'] = $titlematch[1][0];

        $no720p = true;
        preg_match_all('/url=(.*?)u0026/', $videosite, $matches);
        foreach($matches[0] AS $encryptedurls) {
          if($no720p) {
            preg_match_all('/http:\/\/[a-zA-Z0-9-.\/?=&%_]+/', urldecode($encryptedurls), $url);
            if(strpos($url[0][0], 'itag=22') !== false) {
              $videoobj['url'] = $url[0][0];
              $no720p = false;
            }
            elseif(strpos($url[0][0], 'itag=18') !== false) {
              $videoobj['url'] = $url[0][0];
            }
          }
        }
        if(count($matches[0]) == 0) {
          $videoobj = 'invalid';
        }
      }
      else {
        $videoobj = 'invalid';
      }
      
    }
    elseif(strpos($url, 'nicovideo.jp') !== false) {
      
    }
    /* video doesn't work client-side somehow. I'm confused.
    elseif(strpos($url, 'dailymotion.com') !== false) {
    
      $videosite = curl_download($url);
      if($videosite !== false) {
        preg_match_all('/DM_CurrentVideoXID=\'([0-9a-zA-Z]*)\'/', $videosite, $match);
        $videoid = $match[1][0];
        
        $embedsite = curl_download('http://www.dailymotion.com/embed/video/'.$videoid);
        if($embedsite !== false) {
          preg_match_all('/"stream_h264_url":"(.*?)"/', $embedsite, $match);
          $videourl = stripcslashes($match[1][0]);
          $videoobj['url'] = $videourl;
        }
        else {
          $videoobj = 'invalid';
        }
      }
      else {
        $videoobj = 'notexist';
      }
      
    } */
    elseif(strpos($url, 'vimeo.com') !== false) {
      preg_match_all('/[0-9]+/', $url, $match);
      $videoid = $match[0][0];
      $videosite = curl_download('http://player.vimeo.com/video/'.$videoid);
      if($videosite !== false) {
        preg_match_all('/"title":"(.*?)"/', $videosite, $title);
        $videoobj['title'] = $title[1];
        preg_match_all('/h264":.*"hls"/', $videosite, $links);
        preg_match_all('/"(mobile|hd|sd)"/', $links[0][0], $res);
        preg_match_all('/"url":"([a-zA-Z0-9:\/?=&":\.]*?mp4.*?)"/', $videosite, $match);
        if($res[1][0] == 'hd') {
          $videoobj['url'] = $match[1][0];
        }
        elseif($res[1][1] == 'hd') {
          $videoobj['url'] = $match[1][1];
        }
        elseif($res[1][0] == 'sd') {
          $videoobj['url'] = $match[1][0];
        }
        elseif($res[1][1] == 'sd') {
          $videoobj['url'] = $match[1][1];
        }
        else {
          $videoobj['url'] = $match[1][0];
        }
      }
      else {
        $videoobj = 'notexist';
      }
    }
    else {
    
      $videoobj = 'invalid';
      
    }
    
    return $videoobj;
  }
?>