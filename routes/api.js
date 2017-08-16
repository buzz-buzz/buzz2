'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const videoBll = require('../bll/video');

module.exports = function (app, route) {
    route
        .get('/api/index', function* (next) {
            this.body = 'hello';
        })
        .post('/api/videos/:encodedRawPath', function* () {
            let rawPath = new Buffer(this.params.encodedRawPath, 'base64').toString();
            videoBll.asyncApplyProcess(rawPath);
            this.body = 'called';
        })
        .get('/api/videos/:encodedRawPath', function* () {
            let rawPath = new Buffer(this.params.encodedRawPath, 'base64').toString();
            rawPath = rawPath.replace('subtitled-', '');
            console.log('rawPath = ', rawPath);
            if (!fs.existsSync(rawPath)) {
                let parsed = path.parse(rawPath);
                rawPath = `${parsed.dir}${path.sep}${parsed.name}.mp4`;
                console.log('try rawPath = ', rawPath);
            }
            let status = videoBll.getStatusInfo(rawPath);

            this.body = status;
        })
        .get('/api/videos', function* (next) {
            let dir = videoBll.ugcPath();
            let files = fs.readdirSync(dir);
            this.body = files.filter(f => (f.toLowerCase().endsWith('.mp4') || f.toLowerCase().endsWith('.mov')) && f.startsWith('subtitled-')).map(f => {
                let fullPath = path.join(dir, f);
                let encodedPath = new Buffer(fullPath).toString('base64');
                return {
                    videoName: f,
                    url: new Buffer(encodeURIComponent(`/videos/${encodedPath}`)).toString('base64')
                };
            });
        });
};