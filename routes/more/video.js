'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const saas = require('../../bll/saas');
const httpsHelper = require('../../bll/https');
const fs = require('fs');
const request = require('request');
const koaBody = require('koa-body');
const os = require('os');
const path = require('path');
const extname = path.extname;
const parse = require('co-busboy');
const exec = require('child_process').exec;
const stream = require('koa-stream');
const proxy = require('../../service-proxy/proxy');
const greenSharedLogger = require('../../common/logger')('/routes/more/video.js');
const videoBll = require('../../bll/video');

function yieldableExec(command) {
    return function (cb) {
        exec(command, cb);
    }
}

function pipeRequest(from, bucket) {
    return function (cb) {
        from.pipe(request.put(
            composeUrl(config.upload_qiniu.inner.host, config.upload_qiniu.inner.port, '/upload' + bucket), {},
            function (err, response, body) {
                cb(err, body);
            }));
    };
}

function composeUrl(host, port, path) {
    return 'http://' + host + ':' + port + path;
}

module.exports = function (app, router, render, server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('test', function (msg) {
            console.log('message: ' + msg);
        });

        socket.on('video', function (stream) {
            console.log('video', stream);
        });
    });

    // app.use(koaBody({ multipart: true }));

    function* renderVideoSPA() {
        let view = '/video';
        if (true || this.state.userAgent.isMobile) {
            view = '/m' + view;
        }

        console.log(view);

        this.body = yield render.call(this, view, {
            config: config,
            base: saas.getBaseFor(this, '/'),
            title: 'Buzzbuzz English - Record your own videos and share to the world!'
        });
    }

    router
        .get('/video', saas.checkSaasReferer, renderVideoSPA)
        .get('/video-player/:path', saas.checkSaasReferer, renderVideoSPA)
        .get('/video-preview/:path', saas.checkSaasReferer, renderVideoSPA)
        .get('/video-list', saas.checkSaasReferer, renderVideoSPA)
        .put('/videos', function* (next) {
            try {
                if (!this.request.is('multipart/*')) return yield next;

                this.body = yield pipeRequest(this.req, '/buzz-video');
            } catch (ex) {
                this.throw(ex);
            }
        })
        // .post('/videos', function* (next) {
        //     const file = this.request.body.files.file;
        //     const reader = fs.createReadStream(file.path);
        //     const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
        //     reader.pipe(stream);
        //     console.log('uploading %s ---> %s', file.name, stream.path);

        //     this.body = stream.path;
        // })
        .post('/videos', function* (next) {
            let parts = parse(this);
            let part;

            let ugcPaths;
            let videoStoredPath = '';
            let srtStoredPath = '';
            while ((part = yield parts)) {
                if (part && part.filename) {
                    ugcPaths = videoBll.ugcPaths(part.filename);
                    videoStoredPath = ugcPaths.raw;
                    srtStoredPath = ugcPaths.srt;

                    let stream = fs.createWriteStream(videoStoredPath);
                    part.pipe(stream);
                    console.log('uploading %s --> %s', part.filename, stream.path);
                } else {
                    let srt = `1
00:00:00,000 --> 00:00:04,375
${part[1]}

`;
                    fs.writeFileSync(srtStoredPath, srt);
                }
            }

            if (videoStoredPath && srtStoredPath) {
                let finalPath = ugcPaths.output;

                let r = yield proxy({
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

                if (r === 'done') {
                    let encodedPath = new Buffer(finalPath).toString('base64');
                    this.body = `/videos/${encodedPath}`;
                } else {
                    let err = '在生成字幕时产生了错误';
                    greenSharedLogger.error(err);
                    this.throw(err);
                }
            }
        })
        .get('/videos/:path', function* (next) {
            let fpath = new Buffer(this.params.path, 'base64').toString();
            console.log(fpath);
            let fstat = fs.statSync(fpath);

            if (fstat.isFile()) {
                // this.set('Content-disposition', `inline; filename=${path.basename(fpath)}`);
                // this.set('Content-Transfer-Encoding', 'binary');
                // this.type = extname(fpath);
                // this.body = fs.createReadStream(fpath);
                yield stream.file(this, path.basename(fpath), {
                    root: path.dirname(fpath)
                });
            } else {
                this.body = `${fpath} is not a file or is deleted`;
            }
        });
};