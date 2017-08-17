'use strict';



const URL = require('url');

module.exports = {
    checkReferer: function* (next) {
        if (this.req.headers.referer && (this.req.headers.referer.indexOf('/trk_tag') >= 0 || this.req.headers.referer.indexOf('channel') >= 0) &&
            (this.originalUrl.indexOf('trk_tag') < 0 && this.originalUrl.indexOf('channel') < 0)) {
            let sep = this.url.indexOf('?') < 0 ? '?' : '&';
            console.log('=====');
            console.dir(URL);
            let parsed = URL.parse(this.req.headers.referer, true).query;
            console.log(parsed);

            return this.redirect(`${this.url}${sep}trk_tag=${parsed.trk_tag || ''}&channel=${parsed.channel || ''}`);
        }

        yield next;
    }
};