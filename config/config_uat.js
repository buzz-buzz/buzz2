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

    tracking: "http://10.20.32.51:14444/js/t.min.js?write-key=HjYKeEnEV7QiyFXCKxZXrPmqgsjkaQpb"
};