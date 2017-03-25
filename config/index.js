'use strict';

const util = require('util');
const fs = require('fs');

function getPackageJson() {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
}

let packageJson = getPackageJson();

let config = {
    version: packageJson.version,
    imageversion: packageJson.version
};

let configPath = util.format('./config_%s.js', (process.env.NODE_ENV || 'dev'));
let envConfig = require(configPath);

config = Object.assign(config, envConfig);

if (process.env.DATACENTER) {
    config.captcha.public.host = process.env.DATACENTER + '-' + config.captcha.public.host;
}

config.serviceUrls = require('./serviceUrls');

module.exports = config;