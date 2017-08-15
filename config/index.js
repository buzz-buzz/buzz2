'use strict';

const util = require('util');
const fs = require('fs');

function getPackageJson() {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
}

let packageJson = getPackageJson();

let version = packageJson.version.replace(/\./g, '-');

let config = {
    version: version,
    NODE_ENV: process.env.NODE_ENV
};

let configPath = util.format('./config_%s.js', (process.env.NODE_ENV || 'dev'));
let envConfig = require(configPath);

config = Object.assign(config, envConfig);

config.serviceUrls = require('./serviceUrls');

module.exports = config;