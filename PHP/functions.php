<?php
  function checkUsername($username) {
    require_once("config/db.php");
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $stmt = $db->prepare("SELECT id FROM peers WHERE peerid=?"); // Check for all connected users. The signalling server needs unique ids.
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->store_result();
    $numrows = $stmt->num_rows;
    if($numrows < 1) {
      $taken = false;
    }
    else {
      $taken = true;
    }
    $stmt->close();
    
    return $taken;
  }
  
  function checkChannel($channel) {
    require_once("config/db.php");
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $stmt = $db->prepare("SELECT id FROM channels WHERE channelname=?");
    $stmt->bind_param('s', $channel);
    $stmt->execute();
    $stmt->store_result();
    $numrows = $stmt->num_rows;
    if($numrows < 1) {
      $taken = false;
    }
    else {
      $taken = true;
    }
    $stmt->close();
    
    return $taken;
  }
  
  if($_POST['action'] == 'getChannels') {
    $oldchannels = json_decode($_POST["oldchannels"], true);
    require_once("config/db.php");
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    $newchannels = false;
    while(!$newchannels) {
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
        $stmt = $db->prepare("DELETE FROM channels WHERE id =? LIMIT 1");
        $stmt->bind_param('i',  $deleteid);
        $stmt->execute();
            
        $stmt = $db->prepare("DELETE FROM peers WHERE channel =?");
        $stmt->bind_param('i', $deleteid);
        $stmt->execute();
      }

      if($channels != $oldchannels || count($delete) > 0) {
        $newchannels = true;
      }
      usleep(500000);
    }

    $stmt->close();
    print(json_encode($channels));
  }
  
  if($_POST['action'] == 'validate') {
    require_once("config/db.php");
    
    $channelID = $_POST['channelID'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $stmt = $db->prepare("SELECT pwhash FROM channels WHERE id=?");
    $stmt->bind_param('i', $channelID);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($pwhash);
    while($stmt->fetch()) {
      if(password_verify($password, $pwhash)) {
        $joinchannel["password"] = true;
      }
      else {
         $joinchannel["password"] = false;
      }
    }
    $stmt->close();
    $joinchannel["username"] = checkUsername($username);

    echo json_encode($joinchannel);
  }
  
  if($_POST['action'] == 'createChannel') {
    $usertaken = checkUsername($_POST['username']);
    $channeltaken = checkChannel($_POST['channelname']);
    $return = array();
    if(!$usertaken && !$channeltaken) {
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
        $stmt->close();
        
        $return["id"] = $nextid;
        $return["usertaken"] = false;
        $return["channelnametaken"] = false;
      }
    }
    else {
      $return["usertaken"] = $usertaken;
      $return["channelnametaken"] = $channeltaken;
    }
    
    echo json_encode($return);
  }
  
  if($_POST['action'] == 'newpeer') {
    require_once("config/db.php");
    
    $peerid = $_POST['peerid'];
    $channelID = $_POST['channelID'];
    $password = $_POST['password'];
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
      $stmt = $db->prepare("INSERT INTO peers (peerid, channel) VALUES(?, ?)");
      $stmt->bind_param('si', $peerid, $channelID);
      $stmt->execute();
    }
    $stmt->close();
  }
  
  if($_POST['action'] == 'getpeers') {
    require_once("config/db.php");
    
    $clientpeerid = $_POST['peerid'];
    $channelID = $_POST['channelID'];
    $password = $_POST['password'];
    
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
        $stmt = $db->prepare("SELECT * FROM peers WHERE peerid !=? AND channel =?");
        $stmt->bind_param('si', $clientpeerid, $channelID);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($id, $peerid, $channel);
        
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
  
  if($_POST['action'] == 'keepalive') {
    $time_start = microtime(true);
    $execution_time = 0;
    
    require_once("config/db.php");
    $channelID = $_POST['channelID'];
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    while($execution_time < 25) {
      $stmt = $db->prepare("SELECT * FROM peers WHERE channel =?");
      $stmt->bind_param('i', $channelID);
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($id, $peerid, $channel);
      $clients = $stmt->num_rows;
      
      $updatekeepalive = time();
      $stmt = $db->prepare("UPDATE channels SET keepalive =?, clients=? WHERE id =?");
      $stmt->bind_param('iii', $updatekeepalive, $clients, $channelID);
      $stmt->execute();

      sleep(1);

      $execution_time = (microtime(true) - $time_start) / 60;
    }
    
    $stmt->close();
  }
  
  if($_POST['action'] == 'deletepeer') {
    require_once("config/db.php");
    
    $clientpeerid = $_POST['peerid'];
    $channelID = $_POST['channelID'];
    $password = $_POST['password'];
    
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
      $stmt = $db->prepare("DELETE FROM peers WHERE peerid =? AND channel =? LIMIT 1");
      $stmt->bind_param('si', $clientpeerid, $channelID);
      $stmt->execute();
    }
    $stmt->close();
      
  }
  
  if($_POST['action'] == 'geturl') {
    $url = $_POST['url'];
    $videoobj = grabSource($url);
    echo json_encode($videoobj);
  }
  
  function curl_download($url) { // download webpage contents
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_REFERER, "http://examplepage.com/test.html"); // some random stuff because why not
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
        foreach($matches[0] AS $encryptedurls) { //grab either 360p or 720p url
          if($no720p) {
            preg_match_all('/http:\/\/[a-zA-Z0-9-.\/?=&%_]+/', urldecode($encryptedurls), $url);
            if(strpos($url[0][0], 'itag=22') !== false) {
              $videoobj['url'] = preg_replace("/^http:/i", "https:", $url[0][0]);
              $no720p = false;
            }
            elseif(strpos($url[0][0], 'itag=18') !== false) {
              $videoobj['url'] = preg_replace("/^http:/i", "https:", $url[0][0]);
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
    elseif(strpos($url, "nicovideo.jp") !== false) {
      $loginsite = "https://secure.nicovideo.jp/secure/login?site=niconico";
      $username = "kukiodro@wegwerfemail.de";
      $password = "leafcat-sync"; // just some account data that can be public
      $auth_id = "1043043578";
      
      $ch = curl_init(); // login and save session cookies
      curl_setopt($ch, CURLOPT_URL, $loginsite);
      curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.7.12) Gecko/20050915 Firefox/1.0.7");
      curl_setopt($ch, CURLOPT_COOKIESESSION, true);
      curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookie.txt');
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_POST, 1);
      curl_setopt($ch, CURLOPT_POSTFIELDS, "mail_tel=".$username."&password=".$password."&next_url=&show_button_facebook=1&show_button_twitter=1&nolinks=0&_use_valid_error_code=0&auth_id=".$auth_id);
      curl_exec($ch);
      curl_setopt($ch, CURLOPT_URL, $url); // get videopage while using session cookies
      $videosite = curl_exec($ch);
      
      preg_match_all("/http%25253A%25252F%25252Fsmile-[a-zA-Z0-9]*\.nicovideo\.jp%25252Fsmile%25253Fm%25253D[0-9]*\.[0-9]*/", $videosite, $match);
      if($match[0][0]) {
        $videoobj['url'] = urldecode(urldecode(urldecode($match[0][0]))); // decode triple url encoded string (nicovideo pls)
      
        preg_match_all("/title:[\t]*'(.*?)'/", $videosite, $match);
        $videoobj['title'] = json_decode('"'.$match[1][0].'"'); // convert unicode \uxxxx notation to actual chars
      }
      else {
        $videoobj = 'invalid';
      }
    }
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
    elseif(strpos($url, 'soundcloud.com') !== false) {
      $videosite = curl_download($url);
      
      preg_match('/"og:title" content="(.*?)"/', $videosite, $match); // get title
      $videoobj['title'] = $match[1];
      
      preg_match('/sounds:([0-9]*)"/', $videosite, $match);
      $songid = $match[1];
      $videoobj['url'] = "https://api.soundcloud.com/tracks/".$songid."/stream?client_id=b45b1aa10f1ac2941910a7f0d10f8e28"; // get source with client_id
    }
    elseif(strpos($url, 'bandcamp.com') !== false) {
      $videosite = curl_download($url);
      
      preg_match('/title":"(.*?)"/', $videosite, $match); // get title
      $videoobj['title'] = $match[1];
      
      preg_match('/mp3-128":"(.*?)"/', $videosite, $match); // regex url from source
      $videoobj['url'] = preg_replace("/^http:/i", "https:", $match[1]); 
    }
    else {
      $videoobj = 'invalid';
    }
    
    return $videoobj;
  }
?>