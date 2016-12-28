'use strict';

const config = require('../config');
const course = require('../bll/course');

module.exports = function (app, router, render) {
    router
        .get('/admin/courses/add', function *(next) {
            this.body = yield render('admin/courses/add', {
                config: config,
                lesson_id: ''
            })
        })
        .get('/admin/courses/edit/:lesson_id', function*(next) {
            this.body = yield render('admin/courses/add', {
                config: config,
                lesson_id: this.params.lesson_id
            })
        })
    ;
};