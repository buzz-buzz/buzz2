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
            find: {
                frontEnd: '/service-proxy/buzz/courses/:category/:level/:enabled',
                upstream: '/courses/:category/:level/:enabled'
            },
            findByDate: {
                frontEnd: '/service-proxy/buzz/courses/:category/:level/dates/:date',
                upstream: '/courses/:category/:level/dates/:date'
            },
            latest: {
                frontEnd: '/service-proxy/buzz/courses/:level/latest',
                upstream: '/courses/:level/latest'
            }
        },

        categories: {
            list: {
                frontEnd: '/service-proxy/buzz/categories',
                upstream: '/courses/categories'
            }
        },

        courseViews: {
            frontEnd: '/service-proxy/buzz/course-views/:category/:level/:lesson_id',
            upstream: '/course-views/:category/:level/:lesson_id'
        }
    }
};