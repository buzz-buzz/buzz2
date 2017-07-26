module.exports = {
    ensureHttps: function* (next) {
        if (this.request.hostname === 'localhost' || this.request.protocol === 'https') {
            yield next;
        }

        this.redirect(`https://${this.request.host}${this.request.path}?${this.request.querystring}`);
    }
};