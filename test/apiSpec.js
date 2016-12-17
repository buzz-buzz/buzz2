'use strict';

let config = require('../config');

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('../app');

require('co-mocha');

let server = app.listen();

function *testRouter(method, path, data, expectedStatusCode, expectedPattern) {
    yield request(server)[method](path).send(data)
        .expect(expectedStatusCode).expect(expectedPattern)
        .end();
}

function It(method, path, data, expectedStatusCode, expectedPattern) {
    let message = method + ' ' + path;

    it(message, function *() {
        yield testRouter(method, path, data, expectedStatusCode, expectedPattern);
    });
}

['get', 'post', 'put', 'delete'].map(function (method) {
    It[method] = function (path, data, expectedStatusCode, expectedPattern) {
        It(method, path, data, expectedStatusCode, expectedPattern);
    };
});

describe('buzz api', function () {
    It.get('/healthcheck', {}, 200, /is ok/);

    It.get('/api/history-courses', {}, 200, {
        byDate: {'2016-11-07': ['A', 'B'], '2016-12-05': ['A', 'B']},
        byLevel: {
            A: ['2016-11-07', '2016-12-05'],
            B: ['2016-11-07', '2016-12-05']
        }
    });
});