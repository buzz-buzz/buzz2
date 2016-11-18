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
            "code": "BP_S1"
        }
    },

    applicationId: "2b33cf2c-e5dd-4e82-8687-d3fe099a3504",

    logger: {
        appName: 'buzz'
    }
};