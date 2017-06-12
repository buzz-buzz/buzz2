const config = require('../config');
const saas = require('../bll/saas');

module.exports = function (app, router, render) {
    router
        .get('/vocabulary/my', saas.checkSaasReferer, function* (next) {
            this.redirect(saas.generateUrl(this, '/my/vocabulary'), { config: config });
        })
        .get('/vocabulary/print', saas.checkSaasReferer, function* (next) {
            this.body = yield render.call(this, 'vocabulary/vocabulary-printable', { config: config });
        })
        ;
};