'use strict';

const config = require('../../config');
const buzz = require('../../service-proxy-for-server/buzz');
const course = require('../../bll/course');
const mount = require('koa-mount');

module.exports = function (app, router, render) {
    if (process.env.NODE_ENV !== 'prd') {
        app
            .use(mount('/dict', function *() {
                this.redirect('/mock/word/travel/index.json');
            }))
        ;
    }
};