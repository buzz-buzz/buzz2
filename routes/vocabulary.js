const config = require('../config');

module.exports = function (app, router, render) {
    router
        .get('/vocabulary/my', function *(next) {
            this.body = yield render('vocabulary/vocabulary', {config: config});
        })
        .get('/vocabulary/print', function *(next) {
            this.body = yield render('vocabulary/vocabulary-printable', {config: config});
        })
    ;
};