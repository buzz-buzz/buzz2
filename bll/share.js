'use strict';

module.exports = {
    getMyLink: function*() {
        this.body = `/s/ad/${this.state.hcd_user.member_id}`;
    }
};