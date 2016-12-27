'use strict';

const config = require('../config');
const course = require('../bll/course');

module.exports = function (app, router, render) {
    router
        .get('/admin/courses/add', function *(next) {
            this.body = yield render('admin/courses/add', {
                config: config,
                smil_id: ''
            })
        })
        .get('/admin/courses/edit/:smil_id', function*(next) {
            this.body = yield render('admin/courses/add', {
                config: config,
                smil_id: this.params.smil_id
            })
        })
    ;
};