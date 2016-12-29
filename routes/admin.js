'use strict';

const config = require('../config');
const course = require('../bll/course');

module.exports = function (app, router, render) {
    router
        .get('/admin/courses/add', function *(next) {
            this.body = yield render('admin/courses/add', {
                config: config,
                lesson: {}
            })
        })
        .get('/admin/courses/edit/:category/:level/:lesson_id', function*(next) {
            this.body = yield render('admin/courses/add', {
                config: config,
                lesson: {
                    lesson_id: this.params.lesson_id,
                    category: this.params.category,
                    level: this.params.level
                }
            })
        })
    ;
};