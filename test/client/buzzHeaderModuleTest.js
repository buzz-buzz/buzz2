'use strict';

describe('buzz header module', function () {
    var levelFactory;
    var mockBackend;
    var clientConfig;
    var api;

    beforeEach(angular.mock.module('buzzHeaderModule'));
    beforeEach(inject(function (_levelFactory_, $httpBackend, _clientConfig_, _api_) {
        levelFactory = _levelFactory_;
        mockBackend = $httpBackend;
        clientConfig = _clientConfig_;
        api = _api_;
    }));

    it('get level', function () {
        expect(levelFactory.getLevel).toBeDefined();
    });

    it('should return the level from saved preferred value', function (done) {
        mockBackend.expectGET(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd).respond('A');

        levelFactory.getLevel().then(function (result) {
            expect(result).toEqual('A');
        }).finally(function () {
            api.clearAllCache();
            done();
        });

        mockBackend.flush();
    });

    it('should return the default level when error', function (done) {
        mockBackend.expectGET(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd).respond(500, 'error');

        levelFactory.getLevel().then(function (result) {
            expect(result).toEqual('B');
        }).catch(function (reason) {
            expect(reason).toBe('test');
        }).finally(function () {
            api.clearAllCache();
            done();
        });

        mockBackend.flush();
    });

    afterEach(function () {
        // mockBackend.verifyNoOutstandingExpectation();
        // mockBackend.verifyNoOutstandingRequest();
    });
});