'use strict';

const config = require('../config');
const course = require('../bll/course');

module.exports = function (app, router, parse) {
    router
        .get('/api/history-courses', function *(next) {
            this.body = course.list();
        })
    ;
};