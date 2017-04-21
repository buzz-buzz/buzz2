'use strict';

// require('jasmine-promises');

describe('service cache core module', function () {
    var cache;
    var api;

    beforeEach(angular.mock.module('serviceCacheCoreModule'));
    beforeEach(inject(function (_cache_, _api_) {
        cache = _cache_;
        api = _api_;
    }));

    it('can cache a value', function (done) {
        // cache.get('key').then(function (result) {
        //     expect(result).toBe(true);
        //     done();
        // });
        // cache.get('key').then(done);
        // cache.set('key', 'value').then(function () {
        //     expect(cache.get('key')).toBe('value');
        // });
    });
});
