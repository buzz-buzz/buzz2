'use strict';

module.exports = {
    getMyLink: function*() {
        this.body = `/s/ad/${this.query.invite_code}`;
    }
};