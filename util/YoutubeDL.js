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
const { spawn } = require("child_process");
const EventEmitter = require("events");

class YoutubeDL extends EventEmitter {
    constructor(bin, proxy) {
        super();
        this.bin = bin === "" ? "youtube-dl" : bin;
        this.proxy = proxy;
    }

    getMedia(url, addPlaylist) {
        console.log("Getting media for " + url);

        let args = ["--ignore-errors", "--dump-json"];

        if(this.proxy.enabled) {
            if(this.proxy.domains.length === 0) {
                args = args.concat(["--proxy", this.proxy.host + ":" + this.proxy.port]);
            }
            else {
                for(let i = this.proxy.domains.length - 1; i >= 0; i--) {
                    if(url.indexOf(this.proxy.domains[i]) > -1) {
                        args = args.concat(["--proxy", this.proxy.host + ":" + this.proxy.port]);
                        break;
                    }
                }
            }
        }

        if(!addPlaylist) args = args.concat(["--playlist-end", "1"]);

        args.push(url);

        let extractedMediaCount = 0;

        const subprocess = spawn(this.bin, args);

        let jsonString = "";
        subprocess.stdout.on("data", (data) => {
            jsonString += data.toString();

            // youtube-dl output is line feed terminated, byte value 10 == LF
            if(data[data.length - 1] === 10) {
                let media = JSON.parse(jsonString);
                jsonString = "";

                let formats = [];
                if(media.format.indexOf("unknown") === -1) {
                    for(let i = 0; i < media.formats.length; i++) {
                        if(media.formats[i].format_note !== "tiny" && // filter YouTube's audio only formats
                        media.formats[i].acodec !== "none")
                        {
                            if((media.formats[i].ext === "mp4" || media.formats[i].ext === "webm")) {
                                formats.push({
                                    type: "video/" + media.formats[i].ext,
                                    src: media.formats[i].url,
                                    res: media.formats[i].height,
                                    label: media.formats[i].height + "p"
                                });
                            }
                            else if(media.formats[i].ext === "mp3" || media.formats[i].ext === "ogg") {
                                formats.push({
                                    type: "audio/" + media.formats[i].ext,
                                    src: media.formats[i].url,
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
                        src: media.url,
                        label: "unknown"
                    }, 
                    {
                        type: "video/webm",
                        src: media.url,
                        label: "unknown"
                    });
                }
                formats.reverse();

                if(formats.length > 0) {
                    extractedMediaCount++;
                    this.emit("mediaFound", {formats: formats, webpage: media.webpage_url, title: media.title});
                }
            }
        });

        subprocess.stderr.on("data", (data) => {
            console.error(data.toString());
        });

        subprocess.on("close", () => {
            this.emit("getMediaFinished", extractedMediaCount);
        });
    }
}

module.exports = YoutubeDL;
