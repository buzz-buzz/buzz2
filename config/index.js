'use strict';

const util = require('util');

let config = {
    version: '1.2.1-' + Date.now()
};

let configPath = util.format('./config_%s.js', (process.env.NODE_ENV || 'dev'));
let envConfig = require(configPath);

config = Object.assign(config, envConfig);

config.serviceUrls = require('./serviceUrls');

module.exports = config;