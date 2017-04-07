'use strict';

describe('parser module', function () {
    var quizParser;
    var vocabularyParser;

    beforeEach(angular.mock.module('parserModule'));
    beforeEach(inject(function (_quizParser_, _vocabularyParser_) {
        quizParser = _quizParser_;
        vocabularyParser = _vocabularyParser_;
    }));

    let v1QuizJson = {
        quiz1: "/buzz-quiz/20170321-AH-B-1/index.html",
        quiz2: "/buzz-quiz/20170321-AH-B-2/index.html"
    };

    let v2QuizJson = {
        type: 'quiz',
        version: '2.0.0',
        quizzes: [{
            point: 4,
            quiz: "/buzz-quiz/20170321-AH-B-1/index.html",
        }, {
            point: 5,
            quiz: "/buzz-quiz/20170321-AH-B-2/index.html"
        }]
    };

    let parsedQuizJson = [{
        "name": 'quiz1',
        "url": "/buzz-quiz/20170321-AH-B-1/index.html",
        "status": "unchecked"
    }, {
        "name": 'quiz2',
        "url": "/buzz-quiz/20170321-AH-B-2/index.html",
        "status": "unchecked"
    }];

    it('parses old files', function () {
        expect(typeof quizParser.parse).toBe('function');

        expect(quizParser.parseV1(v1QuizJson)).toEqual(parsedQuizJson);

        expect(typeof vocabularyParser.parse).toBe('function');
        var vocabularyJson = {
            caseSensitive: false,
            array: [
                "hero",
                "travel"
            ],
            dictionary: {
                hero: {
                    id: 1,
                    ipa: "1.mp3",
                    url: "/dict/hero/index.html",
                    exercise: "/dict-quiz/hero-quiz/index.html"
                },
                travel: {
                    id: 2,
                    ipa: "3.mp3",
                    url: "/dict/travel/index.html",
                    exercise: "/dict-quiz/travel-quiz/index.html"
                },
                _match_: {
                    id: 7,
                    ipa: "",
                    exercise: "/buzz-quiz/20170321-AH-B-match/index.html"
                }
            }
        };

        expect(vocabularyParser.parseV1(vocabularyJson)).toEqual([{
            "word": "hero",
            "id": 1,
            "url": "/dict/hero/index.html",
            "exercise": "/dict-quiz/hero-quiz/index.html",
            "status": "unchecked"
        }, {
            "word": "travel",
            "id": 2,
            "url": "/dict/travel/index.html",
            "exercise": "/dict-quiz/travel-quiz/index.html",
            "status": "unchecked"
        }, {
            "word": "_match_",
            "id": 7,
            "url": undefined,
            "exercise": "/buzz-quiz/20170321-AH-B-match/index.html",
            "status": "unchecked"
        }]);
    });

    it('parses quiz v2 files', function () {
        expect(quizParser.parseV2(v2QuizJson)).toEqual(parsedQuizJson);
        expect(quizParser.parse(v2QuizJson)).toEqual(parsedQuizJson);
        expect(quizParser.parse(v1QuizJson)).toEqual(parsedQuizJson);
    });
});
