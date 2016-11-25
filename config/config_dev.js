module.exports = {
    cdn: '',

    sso: {
        inner: {
            "host": "uat.service.hcd.com",
            "port": 10086
        }
    },

    captcha: {
        public: {
            "host": "uat.bridgeplus.cn",
            "port": "10001"
        },
        inner: {
            "host": "uat.bridgeplus.cn",
            "port": "10001"
        }
    },

    sms: {
        inner: {
            "host": "uat.service.hcd.com",
            "port": "10002",
            "code": "BUZZ_S1_cn"
        }
    },

    applicationId: "4f6b3929-38c3-4828-88a7-11da836cae34",

    logger: {
        appName: 'buzz'
    },

    mock: false
};