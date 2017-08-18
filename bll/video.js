'use strict';
const path = require('path');
const os = require('os');
const config = require('../config');
const fs = require('fs');
const asyncProxy = require('../service-proxy/async-proxy');

function getVttStoredPath(videoStoredPath) {
    let parsed = path.parse(videoStoredPath);
    return `${parsed.dir}${path.sep}${parsed.name}.vtt`;
}

function getURIAddress(path) {
    let encodedPath = new Buffer(path).toString('base64');
    return `/videos/${encodedPath}`;
}

function getURIAddresses(pathObj) {
    let ret = {};

    Object.keys(pathObj).map(key => {
        if(fs.existsSync(pathObj[key])){
            ret[key] = getURIAddress(pathObj[key]);
        }
    });

    return ret;
}

module.exports = {
    playable: function* () {
        if (this.state.hcd_user) {
            this.body = {
                start: -Infinity,
                end: Infinity
            }
        } else {
            this.body = {
                start: 10,
                end: 30
            }
        }
    },

    ugcPath: function () {
        let base = config.ugcVideoFolder;

        if (!base) {
            base = os.tmpdir();
        }

        return base;
    },

    ugcPaths: function (fileName) {
        let base = this.ugcPath();

        let r = Math.random().toString();
        r = r.substr(r.length - 5);
        let videoStoredPath = path.join(base, `${r}${fileName}`);
        let vttStoredPath = getVttStoredPath(videoStoredPath);

        return {
            raw: videoStoredPath,
            vtt: vttStoredPath
        };
    },

    generateVtt: function(vttPath, dialog){
        dialog = dialog || 'I like drawing, and walking in nature';
        let vtt = `WEBVTT FILE

1
00:00:00.000 --> 00:00:10.375
${dialog}

`;
        fs.writeFile(vttPath, 'WEBVTT FILE\n\n' + vtt);
    },

    getStatusInfo: function (videoStoredPath) {
        let vttPath = getVttStoredPath(videoStoredPath);

        let result = {
            status: 'done',
            raw: getURIAddress(videoStoredPath),
            vtt: getURIAddress(vttPath)
        };

        if (!fs.existsSync(vttPath)) {
            this.generateVtt(vttPath);

            result.status = 'nosub';
            delete result.vtt;
            return result;
        }

        if (!fs.existsSync(videoStoredPath)) {
            result.status = 'novideo';
            delete result.raw;
            return result;
        }

        return result;
    },

    asyncApplyProcess: function (videoStoredPath, srtStoredPath, finalPath) {
        srtStoredPath = srtStoredPath || getSubtitleStoredPath(videoStoredPath);
        finalPath = finalPath || getSubtitledVideoPath(videoStoredPath)._;
        asyncProxy({
            host: config.hongda.host,
            port: config.hongda.port,
            path: '/burn_subtitle',
            method: 'POST',
            data: {
                srtPath: srtStoredPath,
                videoPath: videoStoredPath,
                outputPath: finalPath
            }
        });
    }
};