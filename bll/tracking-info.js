'use strict';

const {
    URL,
    URLSearchParams
} = require('url');

module.exports = {
    checkReferer: function* (next) {
        if (this.req.headers.referer && (this.req.headers.referer.indexOf('/trk_tag') >= 0 || this.req.headers.referer.indexOf('channel') >= 0) &&
            (this.originalUrl.indexOf('trk_tag') < 0 && this.originalUrl.indexOf('channel') < 0)) {
            let sep = this.url.indexOf('?') < 0 ? '?' : '&';
            let parsed = new URL(this.req.headers.referer);
            return this.redirect(`${this.url}${sep}trk_tag=${parsed.searchParams.get('trk_tag')}&channel=${parsed.searchParams.get('channel')}`);
        }

        yield next;
    }
};