"use strict";
var youtubedl = require("youtube-dl");
var app = require("../app")
var config = require("../config.json")[app.get("env")];

class YoutubeDL {
  static getMedia(url, addPlaylist, callback) {
    var args = [];

    //route traffic through http proxy (e.g. to circumvent IP blocks)
    if(config.youtubedl.proxy.enabled) {
      if(config.youtubedl.proxy.domains.length == 0) args = args.concat(["--proxy", config.youtubedl.proxy.host + ":" + config.youtubedl.proxy.port]);
      for(var i = config.youtubedl.proxy.domains.length - 1; i >= 0; i--) {
        if(url.indexOf(config.youtubedl.proxy.domains[i]) > -1) {
          args = args.concat(["--proxy", config.youtubedl.proxy.host + ":" + config.youtubedl.proxy.port]);
          break;
        }
      }
    }
    if(!addPlaylist) args = args.concat(["--playlist-end", "1"]);

    //maxBuffer in KB
    youtubedl.getInfo(url, args, {maxBuffer: config.youtubedl.maxBuffer * 1000}, function(error, media) {
      if(!error) {
        if(Object.prototype.toString.call(media) !== "[object Array]") {
          media = [media];
        }

        var files = [];
        for(var i = 0; i < media.length; i++) {
          var formats = [];
          if(media[i].format.indexOf("unknown") === -1) {
            for(var i2 = 0; i2 < media[i].formats.length; i2++) {
              if(media[i].formats[i2].format_note != "DASH video" && media[i].formats[i2].format_note != "DASH audio" && media[i].formats[i2].acodec != "none") {
                if((media[i].formats[i2].ext == "mp4" || media[i].formats[i2].ext == "webm")) {
                  formats.push({
                    type: "video/" + media[i].formats[i2].ext,
                    src: media[i].formats[i2].url,
                    res: media[i].formats[i2].height,
                    label: media[i].formats[i2].height + "p"
                  });
                }
                else if(media[i].formats[i2].ext == "mp3" || media[i].formats[i2].ext == "ogg") {
                  formats.push({
                    type: "audio/" + media[i].formats[i2].ext,
                    src: media[i].formats[i2].url,
                    label: "audio"
                  });
                }
              }
            }
          }
          else {
            //unknown format
            formats.push({
              type: "video/mp4",
              src: media[i].url,
              label: "unknown"
            }, 
            {
              type: "video/webm",
              src: media[i].url,
              label: "unknown"
            });
          }
          formats.reverse();

          if(!formats.length) return callback(true);

          files.push({formats: formats, webpage: media[i].webpage_url, title: media[i].title});
        }
        return callback(false, files);
      }
      else {
        console.log(error);
        return callback(true);
      }
    });
  }
}

module.exports = YoutubeDL;
