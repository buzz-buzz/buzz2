'use strict';
const path = require('path');
const os = require('os');
const config = require('../config');

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

    ugcPaths: function (fileName) {
        let base = config.ugcVideoFolder;

        if (!base) {
            base = os.tmpdir();
        }

        let videoStoredPath = path.join(base, `${Math.random().toString()}${fileName}`).replace('MOV', 'mp4').replace('mov', 'mp4');

        let parsed = path.parse(videoStoredPath);
        let srtStoredPath = `${parsed.dir}${path.sep}${parsed.name}.srt`;
        let finalPath = `${parsed.dir}${path.sep}subtitled-${parsed.base}`.replace('MOV', 'mp4').replace('mov', 'mp4');

        return {
            raw: videoStoredPath,
            srt: srtStoredPath,
            output: finalPath
        };
    }
};