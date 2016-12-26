module.exports = {
    sso: {
        profile: {
            load: {
                frontEnd: '/service-proxy/sso/profile/load',
                upstream: '/profile/load/:member_id'
            },

            update: {
                frontEnd: '/service-proxy/sso/profile/update',
                upstream: '/profile/update'
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
    },
    buzz: {
        profile: {
            education: {
                frontEnd: '/service-proxy/buzz/profile/education',
                upstream: '/users/:member_id/educations'
            },
            currentLevel: {
                upstream: '/users/:member_id/educations/current-level'
            }
        },

        courses: {
            frontEnd: '/service-proxy/buzz/courses/:category/:level/:enabled',
            upstream: '/courses/:category/:level/:enabled'
        },

        admin: {
            course: {
                frontEnd: '/admin/service-proxy/buzz/courses',
                upstream: '/courses'
            }
        }
    }
};