module.exports = {
    sso: {
        profile: {
            load: {
                frontEnd: '/service-proxy/sso/profile/load',
                upstream: '/profile/load/:member_id'
            },

            peek: {
                frontEnd: '/service-proxy/sso/profile/peek',
                upstream: '/profile/load/:member_id'
            }

        },
        signIn: {
            frontEnd: '/service-proxy/sso/sign-in',
            upstream: '/logon/authentication'
        },
        signUp: {
            frontEnd: '/service-proxy/sso/sign-up',
            upstream: '/member/register'
        }
    },
    sms: {
        sendWithCaptcha: {
            frontEnd: '/service-proxy/sms/send',
            upstream: '/service/sms/send'
        },
        validate: {
            upstream: '/service/sms/validate'
        }
    }
};