'use strict';

module.exports = {
    noCache: function (context) {
        context.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        context.set('Expires', '0');
        context.set('Pragma', 'no-cache');
    }
};