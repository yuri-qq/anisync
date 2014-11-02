<?php
  /**
   * changed mysqli statements to object orientated style
   * original code by php-login.net 
   */

  /**
   * Class registration
   * handles the user registration
   */
  class Registration {
    /**
     * @var object $db_connection The database connection
     */
    private $db_connection = null;
    /**
     * @var array $errors Collection of error messages
     */
    public $errors = array();
    /**
     * @var array $messages Collection of success / neutral messages
     */
    public $messages = array();
    /**
     * the function "__construct()" automatically starts whenever an object of this class is created,
     * you know, when you do "$registration = new Registration();"
     */
    public function __construct() {
      if (isset($_POST["register"])) {
        $this->registerNewUser();
      }
    }
    /**
     * handles the entire registration process. checks all error possibilities
     * and creates a new user in the database if everything is fine
     */
    private function registerNewUser() {
      require_once('recaptchalib.php');
      require_once('config/recaptcha.php');
      $privatekey = PRIVATE_KEY;
      $resp = recaptcha_check_answer($privatekey, $_SERVER["REMOTE_ADDR"], $_POST["recaptcha_challenge_field"], $_POST["recaptcha_response_field"]);
      
      if(!$resp->is_valid) {
        $this->errors[] = "The captcha you entered was incorrect";
      }
      if(empty($_POST['user_name'])) {
      $this->errors[] = "Empty username";
      }
      if(empty($_POST['user_password_new'])) {
        $this->errors[] = "Empty password";
      }
      if($_POST['user_password_new'] !== $_POST['user_password_repeat']) {
        $this->errors[] = "The password don't match";
      }
      if(strlen($_POST['user_password_new']) < 6) {
        $this->errors[] = "The password must have a minimum length of 6 characters";
      }
      if(strlen($_POST['user_name']) > 64 || strlen($_POST['user_name']) < 2) {
        $this->errors[] = "The username can't be shorter than 2 or longer than 64 characters";
      }
      if(!filter_var($_POST['user_email'], FILTER_VALIDATE_EMAIL)) {
        $this->errors[] = "Your email address is not valid";
      }
      
      if($this->errors == null) {
        // create a database connection
        $this->db_connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        // change character set to utf8 and check it
        if(!$this->db_connection->set_charset("utf8")) {
          $this->errors[] = $this->db_connection->error;
        }

        // if no connection errors (= working database connection)
        if(!$this->db_connection->connect_errno) {
          // escaping, additionally removing everything that could be (html/javascript-) code
          $user_name = $this->db_connection->real_escape_string(strip_tags($_POST['user_name'], ENT_QUOTES));
          $user_email = $this->db_connection->real_escape_string(strip_tags($_POST['user_email'], ENT_QUOTES));
          $user_password = $_POST['user_password_new'];
          
          // crypt the user's password with PHP 5.5's password_hash() function, results in a 60 character
          // hash string. The PASSWORD_DEFAULT constant is defined by PHP 5.5
          $user_password_hash = password_hash($user_password, PASSWORD_DEFAULT);

          // check if user or email address already exists
          $stmt = $this->db_connection->prepare("SELECT * FROM users WHERE user_name=? OR user_email =? ;");
          $stmt->bind_param('ss', $user_name, $user_email);
          $stmt->execute();
          $stmt->store_result();
          $stmt->fetch();
          
          if($stmt->num_rows > 0) {
            $this->errors[] = "Sorry, that username/email address is already taken.";
          }
          else {
            // write new user's data into database
            $stmt = $this->db_connection->prepare("INSERT INTO users(user_name, user_password_hash, user_email) VALUES(?, ?, ?);");
            $stmt->bind_param('sss', $user_name,  $user_password_hash, $user_email);
            $success = $stmt->execute();
            
            // if user has been added successfully
            if($success) {
              $this->messages[] = "Your account has been created successfully. You can now log in.";
            }
            else {
              $this->errors[] = "Sorry, your registration failed. Please try again.";
            }
          }
          
          $stmt->close();
        }
        else {
          $this->errors[] = "Sorry, no database connection.";
        }
      }
    }
  }
?>
