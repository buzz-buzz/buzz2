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

module.exports = {
    ugcPath: function () {
        let base = config.ugcVideoFolder;

        if (!base) {
            base = os.tmpdir();
        }

        return base;
    },

    ugcFullPath: function (fileName) {
        let base = this.ugcPath();

        let r = Math
            .random()
            .toString();
        r = r.substr(r.length - 5);
        return path.join(base, `${r}${fileName}`);
    },
};