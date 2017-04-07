'use strict';

describe('parser module', function () {
    var quizParser;

    beforeEach(angular.mock.module('parserModule'));
    beforeEach(inject(function (_quizParser_) {
        quizParser = _quizParser_;
    }));

    it('parses old files', function () {
        expect(typeof quizParser.parse).toBe('function');

        var quizJson = {
            quiz1: "/buzz-quiz/20170321-AH-B-1/index.html",
            quiz2: "/buzz-quiz/20170321-AH-B-2/index.html"
        };

        expect(quizParser.parseV1(quizJson)).toEqual([{
            "name": 'quiz1',
            "url": "/buzz-quiz/20170321-AH-B-1/index.html",
            "status": "unchecked"
        }, {
            "name": 'quiz2',
            "url": "/buzz-quiz/20170321-AH-B-2/index.html",
            "status": "unchecked"
        }]);
    });
});
