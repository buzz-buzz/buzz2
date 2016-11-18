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
            "code": "BP_S1"
        }
    },

    applicationId: "2b33cf2c-e5dd-4e82-8687-d3fe099a3504",

    logger: {
        appName: 'buzz'
    }
};