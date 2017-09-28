'use strict';
const path = require('path');
const os = require('os');
const config = require('../config');
const fs = require('fs');
const asyncProxy = require('../service-proxy/async-proxy');
const Router = require('koa-router');
const proxy = require('../service-proxy/proxy');
const proxyOption = {
    host: config.buzz.inner.host,
    port: config.buzz.inner.port,
};

function getVttStoredPath(videoStoredPath) {
    let parsed = path.parse(videoStoredPath);
    return `${parsed.dir}${path.sep}${parsed.name}.vtt`;
}

function getScorePath(videoStoredPath) {
    let parsed = path.parse(videoStoredPath);
    return `${parsed.dir}${path.sep}${parsed.name}.score`;
}

function getPasteredPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}n-${parsed.base}`;
}

function getPosterPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}${parsed.name}.png`;
}

function getPasteredPosterPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}n-${parsed.name}.png`;
}

function getRecipesPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}${parsed.name}.recipes`;
}

function getExpectedVttStoredPath(videoPath) {
    let parsed = path.parse(videoPath);
    return `${parsed.dir}${path.sep}exp-${parsed.name}.vtt`;
}

function getURIAddress(path) {
    let encodedPath = new Buffer(path).toString('base64');
    return `/videos/${encodedPath}`;
}

function getURIAddresses(pathObj) {
    let ret = {};

    Object
        .keys(pathObj)
        .map(key => {
            if (fs.existsSync(pathObj[key])) {
                ret[key] = getURIAddress(pathObj[key]);
            }
        });

    return ret;
}

module.exports = {
    playable: function*() {
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

        let r = Math
            .random()
            .toString();
        r = r.substr(r.length - 5);
        let videoStoredPath = path.join(base, `${r}${fileName}`);
        let vttStoredPath = getVttStoredPath(videoStoredPath);
        let expectedVttPath = getExpectedVttStoredPath(videoStoredPath);

        return {raw: videoStoredPath, vtt: vttStoredPath, expVtt: expectedVttPath};
    },

    generateVtt: function (vttPath, dialog) {
        let vtt = `WEBVTT

00:00:00.000 --> 00:00:10.375
${dialog}

`;
        fs.writeFileSync(vttPath, vtt, 'utf-8');
    },

    getStatusInfo: function*(videoId) {
        let videoData = yield this.getStatusInfoFromDb(videoId);

        if (this.checkVideoDone(videoData)) {
            if (videoData.score <= 30 && videoData.status !== 0) {
                videoData.status = 0;
            }
            return videoData;
        } else {
            let data = this.getStatusInfoFromFileSystem(videoData.video_path, videoData);
            return data;
        }
    },

    getStatusInfoFromFileSystem: function (videoStoredPath, videoData) {
        let encodedVideoSrc = new Buffer(videoStoredPath, 'base64').toString();
        let decoded = decodeURIComponent(encodedVideoSrc);
        let videoSrc = encodeURIComponent(decoded.replace('/videos/', ''));

        let rawPath = new Buffer(videoSrc, 'base64').toString();
        rawPath = rawPath.replace('subtitled-', '');
        console.log('rawPath = ', rawPath);
        if (!fs.existsSync(rawPath)) {
            let parsed = path.parse(rawPath);
            rawPath = `${parsed.dir}${path.sep}${parsed.name}.mp4`;
            console.log('try rawPath = ', rawPath);
        }
        if (!fs.existsSync(rawPath)) {
            let parsed = path.parse(rawPath);
            rawPath = `${parsed.dir}${path.sep}${parsed.name}.MOV`;
            console.log('try rawPath = ', rawPath);
        }

        videoStoredPath = rawPath;

        let expVttPath = getExpectedVttStoredPath(videoStoredPath);
        let vttPath = getVttStoredPath(videoStoredPath);
        let scorePath = getScorePath(videoStoredPath);
        let pasteredPath = getPasteredPath(videoStoredPath);
        let posterPath = getPosterPath(videoStoredPath);
        let pasteredPosterPath = getPasteredPosterPath(videoStoredPath);
        let recipesPath = getRecipesPath(videoStoredPath);

        let result = {
            status: 3,
            raw: getURIAddress(videoStoredPath),
            video_path: getURIAddress(videoStoredPath),
            vtt: getURIAddress(expVttPath),//字幕文件 vtt
            actualVtt: getURIAddress(vttPath)//识别后的 actualVtt
        };

        if (fs.existsSync(pasteredPath)) {
            result.pastered = getURIAddress(pasteredPath);
        }

        if (fs.existsSync(posterPath)) {
            result.poster = getURIAddress(posterPath);
        }

        if (fs.existsSync(pasteredPath)) {
            result.pastered_poster = getURIAddress(pasteredPosterPath);
        }

        if (!fs.existsSync(expVttPath)) {
            result.status = 2;
            delete result.vtt;
            this.asyncSaveVideoStatus(videoData, result);
            return result;
        }

        let r = ['recipe_nose'];
        if (fs.existsSync(recipesPath)) {
            try {
                r = JSON.parse(fs.readFileSync(recipesPath).toString());
            } catch (ex) {
                r = ['recipe_nose'];
            }
        }

        console.log('------- vtt = ------', vttPath);
        if (!fs.existsSync(vttPath)) {
            console.log('>>>> generating vtt...');
            this.asyncGenerateVtt(videoStoredPath, r);
            result.status = 2;
            delete result.actualVtt;
            this.asyncSaveVideoStatus(videoData, result);
            return result;
        }

        if (fs.existsSync(scorePath)) {
            result.score = fs.readFileSync(scorePath, 'utf-8');
        }

        if (!fs.existsSync(videoStoredPath)) {
            result.status = 2;
            delete result.raw;
            this.asyncSaveVideoStatus(videoData, result);
            return result;
        }

        if (!fs.existsSync(pasteredPath)) {
            result.status = 2;
            delete result.pastered;

            console.log('pastered not exists !!!!', pasteredPath);
            this.asyncGenerateVtt(videoStoredPath, r);
            this.asyncSaveVideoStatus(videoData, result);
            return result;
        }

        //异步存DB
        console.log('========== saving ============');
        console.log(videoData, result);
        this.asyncSaveVideoStatus(videoData, result);
        return result;
    },

    getStatusInfoFromDb: function*(videoId) {
        //get video data from buzz-server
        let path = Router.url('/video/path/info/:video_id', {
            video_id: videoId
        });

        let videoData = yield proxy(Object.assign({
            path: path,
            method: 'GET'
        }, proxyOption));

        if (typeof videoData == 'string') {
            videoData = JSON.parse(videoData);
        }

        return videoData;
    },

    asyncGenerateVtt: function (videoPath, recipes) {
        asyncProxy({
            host: config.hongda.host,
            port: config.hongda.port,
            path: '/recognize',
            method: 'POST',
            data: {
                videoPath: videoPath,
                recipes: recipes
            }
        });
    },

    asyncSaveVideoStatus: function (videoData, data) {
        data.actual_vtt = data.actualVtt || '';

        if (data.score) {
            data.score = parseInt(parseFloat(data.score) * 100);
            if (data.score > 30) {
                data.status = 3;
            } else {
                data.status = 0;
                data.remark = 'low score, pronunciation';
            }
        }

        if (data.pastered) {
            data.video_vfx_path = data.pastered;
        }

        delete data.actualVtt;
        delete data.raw;

        asyncProxy({
            host: config.buzz.inner.host,
            port: config.buzz.inner.port,
            path: '/video/update/info/:video_id'.replace(':video_id', videoData.video_id),
            method: 'POST',
            data: data
        });
    },

    checkVideoDone: function (video) {
        return (video && video.score && video.score > 30 && video.video_vfx_path) || (video && video.score && video.score <= 30 && !video.video_vfx_path);
    }
};