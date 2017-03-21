'use strict';

const config = require('../config');
const membership = require('../membership');
const exercise = require('../bll/exercise');

module.exports = function (app, router, parse) {
    router
        .get(config.serviceUrls.buzz.quiz.limit, membership.setHcdUserIfSignedIn, exercise.limit)
    ;
};