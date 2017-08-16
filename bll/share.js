'use strict';

module.exports = {
    getMyLink: function* () {
        this.body = `/s/ad/${this.query.invite_code}`;
    },
    getLink: function* () {
        this.body = `/?trk_tag=${this.query.invite_code}&channel=${this.query.channel}`;
    }
};