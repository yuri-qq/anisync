<?php 
  /*
   * This only works when using a custom peer.js signaling server.
   * The cloud server doesn't support TLS and the browser wont load mixed content
   *
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == ''){
      $redirect = 'https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
      header("Location: $redirect");
    }
    *
  */ 
  require_once("PHP/classes/Login.php");
  $login = new Login();
?>
<!DOCTYPE html>
<html>
  <head>
    <title>GRZB|SYNC</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="language" content="en" />
    <meta name="keywords" content="video, sync, grzb, synchronization, watch, youtube, together, videos, music" />
    <meta name="description" content="Watch synchronized videos together over the internet" />
    <meta name="page-topic" content="video, multimedia" />
    <link href="javascript/video-js/video-js.css" rel="stylesheet" />
    <script type="text/javascript" src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/ui/1.11.2/jquery-ui.min.js"></script>
    <script type="text/javascript" src="javascript/video-js/video.dev.js"></script>
    <script type="text/javascript" src="http://cdn.peerjs.com/0.3.9/peer.min.js"></script>
    <script type="text/javascript" src="javascript/page.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
  <body>
    <div id="wrapper">
      <div id="addmediainfodiv">
        Accepted video codecs are h264, VP8 and ogg (.mp4/.webm/.ogv)<br />
        You can add the following media resources:<br /><br />
        <div class="mediaresource">
          <div id="linklogo"></div>Direct links<br />
          <div class="mediainfotext">
            e.g. http://mywebsite.net/video.mp4<div class="mediainfotextgrey">|.webm|.ogv</div>
          </div>
        </div>
        <div class="seperator"></div>
        <div class="mediaresource">
          <div id="ytlogo"></div>
          <div class="mediainfotext">
            e.g. https://www.youtube.com/watch?v=UC_qla6FQwM<br />
            Note: Only 360p and 720p are available as mp4 video and can be played on this site. 144p/240p videos can't be played.
          </div>
        </div>
        <div class="seperator"></div>
        <div class="mediaresource">
          <div id="vimeologo"></div>
          <div class="mediainfotext">
            e.g. http://vimeo.com/82522802<br />
          </div>
        </div>
        <div class="seperator"></div>
      </div>
      <div id="header">
        <div id="logo">
          <a href="http://sync.grzb.de/"><p id="grzb">GRZB</p><p id="sep">|</p><p id="synch">SYNC</p></a>
        </div>
        <?php
          if($login->isUserLoggedIn()) { ?>
            <div id="logoutbtn">
              <div id="logoutarrow"></div>Logout
            </div>
            <div id="loginbtn" style="display:none">
              Login<div id="loginarrow"></div>
            </div><?php
          }
          else { ?>
            <div id="logoutbtn" style="display:none">
              <div id="logoutarrow"></div>Logout
            </div>
            <div id="loginbtn">
              Login<div id="loginarrow"></div>
            </div><?php
          }
        ?>
        <div id="login">
          <form method="post" id="loginform">
            Username<br />
            <input id="username" name="user_name" type="text" /><br />
            Password<br />
            <input id="password" name="user_password" type="password" required /><br />
            <input id="submitlogin" type="submit" value="Login" required /><br />
          </form>
          <input id="registerbtn" type="submit" value="Register" />
        </div>
        <div id="register">
          <form method="post" id="registerform" autocomplete="off">
            Username<br />
            <input name="user_name" type="text" required /><br />
            E-mail<br />
            <input name="user_email" type="text" required /><br />
            Password<br />
            <input name="user_password_new" type="password" required /><br />
            Repeat password<br />
            <input name="user_password_repeat" type="password" required /><br />
              <?php
                require_once('PHP/recaptchalib.php');
                $publickey = "6Ld7EfkSAAAAAJ8vBsTgPjiqD6HItVraGUVFFAKC";
                echo recaptcha_get_html($publickey, NULL, TRUE);
              ?>
            <input type="submit" value="Register" />
          </form>
        </div>
      </div>
      <div id="systemmsg"></div>
      <div id="createchanneloverlay">
        <form method="post" id="createchannelform" autocomplete="off">
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
      <div id="checkpassword">
        <form method="post" id="checkpasswordform" autocomplete="off">
          Password:<br />
          <input type="password" name="checkchannelpw" id="checkchannelpw" required /><br />
          <input type="submit" value="Join channel" />
        </form>
      </div>
      <div class="sidebar"></div>
      <div id="content">
        <br />
        <br />
        <a class="anchor" name="english">
          <h1><a class="anchor english" href="#english">「<u>English</u>」</a> - <a class="anchor german" href="#german">「German」</a></h1>
        </a><br />
        <a class="anchor" name="english"><h1>Legal Notice</h1></a>
        <br />
        <br />
        <p>Jannes Grzebien<br />
        Hauptstraße 16<br />
        22964 Steinburg<br />
        Germany
        </p>
        <br />
        <h2>Contact:</h2>
        <table><tr>
        <td>Telephone:</td>
        <td>01637734855</td></tr>
        <tr><td>E-Mail:</td>
        <td>jannesgrzebien@gmail.com</td>
        </tr></table>
        <p> </p>
        <br />
        <br />
        <h2>Disclaimer:</h2>
        <br />
        <p><strong>Liability for content</strong></p>
        <p>After general law we, as service provider, are responsible for our content on this website.
        However, as a service provider we are not obliged to monitor transmitted or stored third party content or to investigate circumstances that indicate illegal activity.
        Obligations to remove or block the use of information under the general laws remain untouched.
        However, a relevant liability is only possible from the date of knowledge of a specific infringement. 
        If we become aware of such violations, we will remove that content immediately.</p>
        <br />
        <p><strong>Liability for links</strong></p>
        <p>Our website contains links to external websites over which we have no control.
        Therefore we can not take any responsibility for their content.
        The respective provider or operator is always responsible for the contents of any linked site.
        The linked sites were checked at the time of linking for possible legal violations.
        Illegal contents were not found at the time of linking.
        A permanent monitoring of the linked pages for legal violations is unreasonable without concrete evidence of a violation.
        If we become aware of such violations, we will remove these links immediately.</p>
        <br />
        <p><strong>Copyright</strong></p>
        <p>The contents and works on this website created by the site operator are protected by German copyright law.
        Duplication, editing, distribution and any kind of usage outside the limits of the copyright require the written approval of the respective author or creator.
        Downloads and copies of this website are only permitted for private, non-commercial use.
        As far as the content is not created by the website operator, we respect the copyrights of third parties.
        We also mark third party content particularly as such.
        If you notice a copyright infringement, we kindly ask you to inform us.
        If we become aware of such violations, we will remove that content immediately.</p><p> </p>
        <br />
        <br />
        <h2>Privacy Policy:</h2>
        <br />
        <p><strong>Data privacy</strong></p>
        <p>The use of our website is usually possible without providing personal information.
        If personal data (eg name, address or e-mail address) is requested on our website, this is as far as possible, on a freely basis of the user.
        This data will not be shared with third parties without your explicit permission.</p>
        
        <p>We note that data transmission over the Internet (eg communication by e-mail) may have security vulnerabilities.
        Complete protection of your data against access by third parties is not possible.</p>
        
        <p>The use of published contact data by third parties for sending unsolicited advertisements and information materials is hereby expressly prohibited.
        The site operators reserve the right to take legal actions in case of unsolicited promotional information, such as spam e-mails.</p>
        <br />
        <br />
        
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <a class="anchor" name="german">
          <h1><a class="anchor english" href="#english">「English」</a> - <a class="anchor german" href="#german">「<u>German</u>」</a></h1>
        </a><br />
        <h1>Impressum</h1>
        <br />
        Angaben gemäß § 5 TMG:
        <br />
        <p>Jannes Grzebien<br />
        Hauptstraße 16<br />
        22964 Steinburg
        </p>
        <br />
        <h2>Kontakt:</h2>
        <table><tr>
        <td>Telefon:</td>
        <td>01637734855</td></tr>
        <tr><td>E-Mail:</td>
        <td>jannesgrzebien@gmail.com</td>
        </tr></table>
        <p> </p>
        <p>Quelle: <em><a rel="nofollow" href="http://www.e-recht24.de">Impressum-Generator</a> von e-recht24.de für Privatpersonen.</em></p>
        <br />
        <br />
        <h2>Haftungsausschluss (Disclaimer):</h2>
        <br />
        <p><strong>Haftung für Inhalte</strong></p> <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
        <br />
        <p><strong>Haftung für Links</strong></p> <p>Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
        <br />
        <p><strong>Urheberrecht</strong></p> <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p><p> </p>
        <p><em>Quellverweis: <a rel="nofollow" href="http://www.e-recht24.de/muster-disclaimer.html" target="_blank">eRecht24</a></em></p>
        <br />
        <br />
        <h2>Datenschutzerklärung:</h2>
        <br />
        <p><strong>Datenschutz</strong></p> <p>Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben. </p> <p>Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich. </p> <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor.</p><p> </p>
        <br />
      </div>
      <div class="sidebar"></div>
      <div class="clear"></div>
      <div id="footer">
        <a class="privacy" href="legal.php">Legal Notice</a>
      </div>
    </div>
  </body>
</html>