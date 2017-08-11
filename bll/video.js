'use strict';
const path = require('path');
const os = require('os');
const config = require('../config');
const fs = require('fs');

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

        let videoStoredPath = path.join(base, `${Math.random().toString()}${fileName}`).replace('MOV', 'mp4').replace('mov', 'mp4');

        let parsed = path.parse(videoStoredPath);
        let srtStoredPath = getSubtitleStoredPath(videoStoredPath);
        let finalPath = `${parsed.dir}${path.sep}subtitled-${parsed.base}`.replace('MOV', 'mp4').replace('mov', 'mp4');

        return {
            raw: videoStoredPath,
            srt: srtStoredPath,
            output: finalPath
        };
    },

    getStatusInfo: function (videoStoredPath) {
        let parsed = path.parse(videoStoredPath);
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
    }
};