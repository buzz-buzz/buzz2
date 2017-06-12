'use strict';

const logger = require('greenShared/logger');
const config = require('../config');

function init(config) {
    if (!config) {
        return;
    }

    logger.init(config.logger);
}

init(config);

module.exports = logger;