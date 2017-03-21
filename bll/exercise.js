'use strict';

module.exports = {
    limit: function*() {
        if (this.state.hcd_user) {
            this.body = Infinity;
        } else {
            this.body = 1;
        }
    }
};