module.exports = {
    cdn: '',

    sso: {
        inner: {
            "host": "service.bridgeplus.cn",
            "port": 10086
        }
    },

    captcha: {
        public: {
            "host": "captcha.service.bridgeplus.cn",
            "port": "80"
        },
        inner: {
            "host": "service.bridgeplus.cn",
            "port": "10001"
        }
    },

    sms: {
        inner: {
            "host": "service.bridgeplus.cn",
            "port": "10002",
            "code": "BUZZ_S1_cn"
        }
    },

    buzz: {
        inner: {
            host: 'service.bridgeplus.cn',
            port: 16160
        }
    },

    wechat: {
        inner: {
            host: 'service.bridgeplus.cn',
            port: 10101,
            app_id: 'buzz'
        },
        returnHost: 'http://buzzbuzzenglish.com'
    },

    applicationId: "4f6b3929-38c3-4828-88a7-11da836cae34",

    logger: {
        appName: 'buzz'
    },

    tracking: "http://tracking.buzzbuzzenglish.com/js/t.js?write-key=BeUYw5s9DgGdga4XX02V0DuBYsDDxNE8",

    admins: ['484f357e-a6ff-4651-bfc0-8dbe610496d7'],

    rootDomain: ".buzzbuzzenglish.com"
};