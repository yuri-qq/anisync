// This file is part of anisync.
// Copyright (C) 2020 Jannes Grzebien
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use strict";
var youtubedl = require("youtube-dl");
var app = require("../app");
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
                            if(media[i].formats[i2].format_note != "DASH video" &&
                 media[i].formats[i2].format_note != "DASH audio" &&
                 media[i].formats[i2].format_note != "tiny" && // filter YouTube's audio only formats
                 media[i].formats[i2].acodec != "none")
                            {
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
