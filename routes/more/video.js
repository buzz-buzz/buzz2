'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');
const saas = require('../../bll/saas');
const fs = require('fs');
const request = require('request');
const koaBody = require('koa-body');
const os = require('os');
const path = require('path');
const extname = path.extname;
const parse = require('co-busboy');
const exec = require('child_process').exec;


function yieldableExec(command) {
    return function (cb) {
        exec(command, cb);
    }
}

function pipeRequest(from, bucket) {
    return function (cb) {
        from.pipe(request.put(
            composeUrl(config.upload_qiniu.inner.host, config.upload_qiniu.inner.port, '/upload' + bucket),
            {
            },
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

    router
        .get('/video*', saas.checkSaasReferer, function* () {
            this.body = yield render.call(this, '/m/video', {
                config: config,
                base: saas.getBaseFor(this, '/'),
                title: 'video demo'
            })
        })
        .put('/videos', function* (next) {
            if (!this.request.is('multipart/*')) return yield next

            this.body = yield pipeRequest(this.req, config.serviceUrls.buzz.picture.upload.bucket);
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

            while ((part = yield parts)) {
                let stream = fs.createWriteStream(path.join(os.tmpdir(), `${Math.random().toString()}${part.filename}`));
                part.pipe(stream);
                console.log('uploading %s --> %s', part.filename, stream.path);
                let outputPath = (path.join(os.tmpdir(), `${Math.random().toString()}${part.filename}`));

                let command = 'C:\\ffmpeg\\bin\\ffmpeg.exe -i C:\\Users\\Jeff\\Downloads\\2.mp4 -i ' + stream.path + ' -filter_complex "[0:v:0] [0:a:0] [1:v:0] [1:a:0] concat=n=2:v=1:a=1 [v][a]" -map "[v]" -map "[a]" ' + outputPath;

                let r = yield yieldableExec(command);

                let encodedPath = new Buffer(outputPath).toString('base64');

                this.body = `/videos?path=${encodedPath}`;
            }
        })
        .get('/testcommand', function* (next) {
            let r = yield yieldableExec('dir');
            this.body = `stdout: ${r[0]}\nstderr: ${r[1]}\nexec error: ${r[2]}`;
        })
        .get('/__dirname', function* (next) {
            this.body = __dirname;
        })
        .get('/videos', function* (next) {
            let fpath = new Buffer(this.query.path, 'base64').toString();
            let fstat = fs.statSync(fpath);

            if (fstat.isFile()) {
                this.type = extname(fpath);
                this.body = fs.createReadStream(fpath);
            } else {
                this.body = `${fpath} is not a file or is deleted`;
            }
        })
        ;
};
