'use strict';

const url = require('url');
const proxy = require('../service-proxy/proxy');
const config = require('../config');

module.exports = {
    getShortId: function (shortUrl) {
        let reg = /https\:\/\/www\.wenjuan\.com\/s\/(\w+)\/?/;
        return reg.exec(shortUrl)[1];
    },

    getIframeUrl: function (shortUrl) {
        return `${shortUrl}?iframe=1&`;
    },

    getLongId: function* (shortUrl) {
        let shortId = this.getShortId(shortUrl);
        let surveyInfoUrl = yield proxy({
            host: config.wechatSign.inner.host,
            port: config.wechatSign.inner.port,
            path: `/survey/info/buzzbuzz/${shortId}`,
            method: 'GET'
        });

        let parsedUrl = url.parse(surveyInfoUrl);
        let info = yield proxy({
            host: parsedUrl.host,
            port: parsedUrl.port || '80',
            path: parsedUrl.path,
            method: 'GET'
        });

        return JSON.parse(info).project_id;
    }
};