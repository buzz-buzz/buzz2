module.exports = {
    sso: {
        profile: {
            load: {
                frontEnd: '/service-proxy/sso/profile/load',
                abbr: '/profile/load',
                upstream: '/profile/load'
            },

            peek: {
                frontEnd: '/service-proxy/sso/profile/peek',
                abbr: '/profile/peek',
                upstream: '/profile/load/:member_id'
            }

        },
        signIn: {
            frontEnd: '/service-proxy/sso/sign-in',
            upstream: '/logon/authentication'
        }
    }
};