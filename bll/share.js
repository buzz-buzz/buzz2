'use strict';

module.exports = {
    getMyLink: function*() {
        this.body = `/share?trk_tag=${this.state.hcd_user.member_id}`;
    }
};