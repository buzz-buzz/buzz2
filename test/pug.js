'use strict';

let assert = require('assert'),
    request = require('co-supertest'),
    app = require('./fixtures/app'),
    escape = require('escape-html');

require('co-mocha');

let server = app.listen();

function testHelper(pugFile, contains, doLog, data) {
    data = data || {};

    return request(server)
        .post('/')
        .set('pugFile', pugFile)
        .set('doLog', doLog)
        .send(data)
        .expect(200)
        .expect(contains)
        .end();
}

describe('pug', function () {
    it('should contain href="test.com" in response', function *() {
        yield testHelper('attr', /href="test.com"/, true);
    });
});