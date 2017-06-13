'use strict';

let clearCookieOption = {
    expires: new Date(1970, 1, 1),
    path: '/',
    httpOnly: true
};
let sessionCookieOption = {
    expires: 0,
    path: '/',
    httpOnly: true
};

let o = {
    setToken: function (token) {
        this.cookies.set('token', token, sessionCookieOption);
    },
    deleteToken: function () {
        this.cookies.set('token', '', clearCookieOption);
    },
    setMID: function setMIDCookie(member_id) {
        this.cookies.set('mid', member_id, {
            expires: 0,
            path: '/',
            httpOnly: false
        });
    },
    deleteMID: function () {
        this.cookies.set('mid', '', clearCookieOption);
    }
};

o.resetSignOnCookies = function (result) {
    o.deleteToken.call(this);
    o.deleteMID.call(this);

    o.setToken.call(this, result.token);
    o.setMID.call(this, result.member_id);
}

module.exports = o;