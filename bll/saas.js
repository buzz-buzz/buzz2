'use strict';

module.exports = {
    generateUrl: function (context, url) {
        if (context.state.saas && url.indexOf('/') === 0) {
            return `/saas${url}`;
        }

        return url;
    },

    checkSaasReferer: function* (next) {
        if (this.req.headers.referer && this.req.headers.referer.indexOf('/saas') >= 0 &&
            this.originalUrl.indexOf('/saas') < 0) {
            return this.redirect(`/saas${this.url}`);
        }

        yield next;
    },

    getBaseFor: function (context, path) {
        if (context.state.saas) {
            return `/saas${path}`;
        }

        return path;
    }
};