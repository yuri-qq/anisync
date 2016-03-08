"use strict";
var youtubedl = require("youtube-dl");
var app = require("../app")
const CONFIG = require("../config.json")[app.get("env")];

class YoutubeDL {
  static getMedia(url, addPlaylist, callback) {
    var args = [];

    //route traffic to youtube through http proxy to circumvent IP blocks
    if(url.indexOf("youtube.com") > -1 && CONFIG.youtubedlProxy.host && CONFIG.youtubedlProxy.port) args = args.concat(["--proxy", CONFIG.youtubedlProxy.host + ":" + CONFIG.youtubedlProxy.port]);
    if(!addPlaylist) args = args.concat(["--playlist-end", "1"]);

    youtubedl.getInfo(url, args, {maxBuffer: 1024000 * 5}, function(error, media) {
      if(!error) {
        if(Object.prototype.toString.call(media) !== "[object Array]") {
          media = [media];
        }

        var files = [];
        
        for(var i = 0; i < media.length; i++) {
          var formats = [];
          if(media[i].formats) {
            for(var i2 = 0; i2 < media[i].formats.length; i2++) {
              if(media[i].formats[i2].format_note != "DASH video" && media[i].formats[i2].format_note != "DASH audio") {
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
            formats.push({
              type: "application/octet-stream",
              src: media[i].url,
              label: (media[i].height ? media[i].height + "p" : "unknown")
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
