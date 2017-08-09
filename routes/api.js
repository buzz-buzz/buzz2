const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = function (app, route) {
    route
        .get('/api/index', function* (next) {
            this.body = 'hello';
        })
        .get('/api/videos', function* (next) {
            let dir = os.tmpdir();
            let files = fs.readdirSync(dir);
            this.body = files.filter(f => f.startsWith('subtitled-') && f.endsWith('.mp4')).map(f => {
                let fullPath = path.join(dir, f);
                return {
                    videoName: f,
                    fullPath: fullPath,
                    encodedPath: new Buffer(fullPath).toString('base64')
                }
            });
        });
};