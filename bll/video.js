'use strict';
const path = require('path');
const os = require('os');
const config = require('../config');
const fs = require('fs');
const asyncProxy = require('../service-proxy/async-proxy');

function getSubtitleStoredPath(videoStoredPath) {
    let parsed = path.parse(videoStoredPath);
    return `${parsed.dir}${path.sep}${parsed.name}.srt`;
}

function getSubtitledVideoPath(videoStoredPath) {
    let parsed = path.parse(videoStoredPath);
    return `${parsed.dir}${path.sep}subtitled-${parsed.base}`;
}

function getURIAddress(path) {
    let encodedPath = new Buffer(path).toString('base64');
    return `/videos/${encodedPath}`;
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
        r = r.substr(r.length-5);
        let videoStoredPath = path.join(base, `${r}${fileName}`);
        let srtStoredPath = getSubtitleStoredPath(videoStoredPath);
        let finalPath = getSubtitledVideoPath(videoStoredPath);

        return {
            raw: videoStoredPath,
            srt: srtStoredPath,
            output: finalPath
        };
    },

    getStatusInfo: function (videoStoredPath) {
        let srtStoredPath = getSubtitleStoredPath(videoStoredPath);
        let subTitledVideoPath = getSubtitledVideoPath(videoStoredPath);

        let result = {
            status: 'done',
            raw: getURIAddress(videoStoredPath),
            subtitle: getURIAddress(srtStoredPath),
            subtitled: getURIAddress(subTitledVideoPath)
        };

        if (!fs.existsSync(subTitledVideoPath)) {
            result.status = 'processing';
            delete result.subtitled;
            return result;
        }

        if (!fs.existsSync(srtStoredPath)) {
            result.status = 'nosub';
            delete result.subtitle;
            return result;
        }

        if (!fs.existsSync(videoStoredPath)) {
            result.status = 'novideo';
            delete result.raw;
            return result;
        }

        return result;
    },

    asyncApplyProcess: function(videoStoredPath, srtStoredPath, finalPath){
        srtStoredPath = srtStoredPath || getSubtitleStoredPath(videoStoredPath);
        finalPath = finalPath || getSubtitledVideoPath(videoStoredPath);
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