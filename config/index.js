'use strict';

const util = require('util');

let config = {
    version: '1.2.1-' + Date.now(),
    imageversion: "1.2.1-1489131411950"
};

let configPath = util.format('./config_%s.js', (process.env.NODE_ENV || 'dev'));
let envConfig = require(configPath);

config = Object.assign(config, envConfig);

if (process.env.DATACENTER) {
    config.captcha.public.host = process.env.DATACENTER + '-' + config.captcha.public.host;
}

config.serviceUrls = require('./serviceUrls');

module.exports = config;