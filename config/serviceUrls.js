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
            },

            changePassword: {
                frontEnd: '/service-proxy/sso/password/change',
                upstream: '/profile/changepassword'
            },

            changeMobile: {
                frontEnd: '/service-proxy/sso/mobile'
            }
        },
        signIn: {
            frontEnd: '/service-proxy/sso/sign-in',
            upstream: '/logon/authentication'
        },
        signUp: {
            frontEnd: '/service-proxy/sso/sign-up',
            upstream: '/member/register'
        },
        resetPassword: {
            frontEnd: '/service-proxy/sso/password/reset',
            upstream: '/member/resetPassword'
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
            latestEducation: {
                frontEnd: '/service-proxy/buzz/profile/education',
                upstream: '/users/:member_id/educations/latest'
            },
            latestAllEducation: {
                frontEnd: '/service-proxy/buzz/profile/education-all',
                upstream: '/users/:member_id/educations/latest-all'
            },
            currentLevel: {
                frontEnd: '/service-proxy/buzz/profile/current-level',
                upstream: '/users/:member_id/educations/current-level'
            }
        },

        courses: {
            find: {
                frontEnd: '/service-proxy/buzz/courses/:category/:level',
                upstream: '/courses/:category/:level/true'
            },
            findByLevel: {
                frontEnd: '/service-proxy/buzz/courses/:level',
                upstream: '/courses/:level/true'
            },
            findByDate: {
                frontEnd: '/service-proxy/buzz/courses/:category/:level/dates/:date',
                upstream: '/courses/:category/:level/dates/:date'
            },
            latest: {
                frontEnd: '/service-proxy/buzz/courses/:level/latest',
                upstream: '/courses/:level/latest'
            },
            search: {
                frontEnd: '/service-proxy/buzz/search-courses',
                upstream: '/courses'
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
        },

        quiz: {
            result: {
                frontEnd: '/service-proxy/buzz/quiz/result',
                upstream: {
                    save: '/quiz/save_result',
                    get: '/quiz/get_result'
                }
            },
            resultGroup: {
                frontEnd: '/service-proxy/buzz/quiz/result-group',
                upstream: {
                    save: '/quiz/save_result_group'
                }
            },
            vocabularyPerformance: {
                frontEnd: '/service-proxy/buzz/quiz/vocabulary',
                upstream: '/quiz/vocabulary/:member_id/:lesson_id'
            },
            dailyExercisePerformance: {
                frontEnd: '/service-proxy/buzz/quiz/daily-exercise',
                upstream: '/quiz/daily-exercise/:quiz_result_group_id'
            },
            lessonCount: {
                frontEnd: '/service-proxy/buzz/quiz/lesson-count',
                upstream: '/quiz-group/lesson-count'
            },
            limit: '/service-proxy/exercise/limit'
        },
        share: {
            myLink: '/service-proxy/share/my-link'
        }
    }
};