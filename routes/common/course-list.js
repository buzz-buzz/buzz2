'use strict';

const config = require('../../config');
const saas = require('../../bll/saas');
const renders = require('../../common/enhanced-render');

module.exports = {
    render: function* (next) {
        if (!this.state.userAgent.isMobile || this.state.userAgent.isTablet) {
            this.body = yield renders.render.call(this, 'my/history', {
                config: config,
                hcd_user: this.state.hcd_user
            });
        } else {
            this.body = yield renders.render.call(this, 'm/history', {
                config: config,
                hcd_user: this.state.hcd_user,
                base: saas.getBaseFor(this, '/'),
                title: 'Buzzbuzz English',
                backUrl: 'javascript:location.href="/"'
            });
        }
    }
}