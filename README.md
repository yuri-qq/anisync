# anisync
A service to synchronize media playback between browsers.

# Dependencies
* [MongoDB](https://www.mongodb.org)
* [youtube-dl](https://youtube-dl.org)

# Installation
To to install all necessary Node.js packages, type:
```
npm install
```
in this project's root directory.  
Run with:
```
node app.js
```

# Configuration
The config.json has 2 identical blocks, one for development and one for production environment which are structured as follows:
```javascript
{
  "web" : {
    "host": "localhost", //address the web server should bind to
    "http": {
      "port": 80 //port for unencrypted traffic
    },
    "https": { //optional, but recommended
      "enabled": false, //will also redirect all unencrypted traffic to https
      "hsts": true, //HTTP Strict Transport Security
      "port": 443, //port for encrypted traffic
      "certificate": { //SSL certificate is required for https to work
        "key": "",
        "cert": ""
      }
    },
    "trustedProxies": [] //List of trusted reverse proxies. X-Real-IP header has to be set.
  },
  "mongodb": {
    "host": "localhost", //address of the MongoDB server
    "port": 27017, //port of MongoDB server
    "database": "sync", //database name (will be created automatically)
    "user": "", //MongoDB login username, if necessary
    "password": "" //MongoDB login password, if necessary
  },
  "youtubedl": {
    "bin": "", //Location of the youtube-dl binary. Defaults to "youtube-dl".
    "proxy": { //optional HTTP proxy for Youtube-DL (e.g. to bypass IP blocks)
      "enabled": false,
      "domains": ["youtube.com"], //list of domains that should be routed through the proxy
                                  //if empty and enabled: true, route all requests through proxy
      "host": "localhost", //address of proxy server
      "port": 8118 //port of proxy server
    }
  },
  "sessionSecret": "changeme", //secret of session cookies, choose a long and secure string
  "google": {
    "analytics": { //optional Google analytics tracking code
      "enabled": false,
      "trackingID": "" //tracking ID of property
    },
    "adsense": { //optional Google adsense ads
      "enabled": false,
      "adSlot": "",
      "adClient": "" 
    }
  },
  "piwik": { //optional Piwik tracking code
    "enabled": false,
    "url": "", //Piwik report URL
    "siteId": 1 //Piwik site ID
  }
}
```
