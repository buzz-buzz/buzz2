'use strict';

const views = require('co-views');
const path = require('path');

const render = views(path.join(__dirname, '../views'), {
    default: "pug",
    extension: "pug",
    map: {
        "html": "underscore"
    }
});

function* enhancedRender(view, locals) {
    return yield render(view, Object.assign({}, this.state, locals));
}

module.exports = {
    render: render,
    enhancedRender: enhancedRender
};