'use strict';

module.exports = {
    getMyLink: function*() {
        this.body = `/share?member_id=${this.state.hcd_user.member_id}`;
    }
};