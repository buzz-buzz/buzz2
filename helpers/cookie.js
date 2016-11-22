'use strict';

module.exports = {
    deleteToken: function () {
        let clearCookieOption = {
            expires: new Date(1970, 1, 1),
            path: '/',
            httpOnly: true
        };

        this.cookies.set('token', '', clearCookieOption);
    }
};