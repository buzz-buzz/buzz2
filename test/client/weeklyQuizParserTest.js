'use strict';

describe('weekly quiz parser', function () {
    let p;

    beforeEach(angular.mock.module('parserModule'));
    beforeEach(inject(function (_weeklyQuizParser_) {
        p = _weeklyQuizParser_;
    }));

    let jsonArray = [
        {
            "type": "quiz",
            "version": "2.0.0",
            "weekly-quizzes": [
                {
                    "sub-type": "quiz-group",
                    "id": "BQDC",
                    "name": "根据汉语意思补全单词",
                    "quizzes": [
                        {
                            "point": 4,
                            "quiz": "/buzz-quiz/20170321-AH-B-1/index.html"
                        },
                        {
                            "point": 5,
                            "quiz": "/buzz-quiz/20170321-AH-B-2/index.html"
                        }
                    ]
                },
                {
                    "sub-type": "quiz-group",
                    "id": "test",
                    "name": "另外一种测试",
                    "quizzes": [
                        {
                            point: 6,
                            "quiz": "another url"
                        }, {
                            point: 7,
                            quiz: "yet another url"
                        }
                    ]
                }
            ]
        }, {
            type: 'quiz',
            'version': "2.0.0",
            "weekly-quizzes": [
                {
                    "sub-type": "quiz-group",
                    "id": "test",
                    "name": "另外一种测试",
                    "quizzes": [
                        {
                            point: 7,
                            quiz: 'xxxx.com'
                        }, {
                            point: 8,
                            quiz: 'yyyy.com'
                        }
                    ]
                }, {
                    'sub-type': 'quiz-group',
                    id: 'BQDC',
                    name: '根据汉语意思补全单词',
                    quizzes: [{
                        point: 9,
                        quiz: 'wwww.com',
                    }, {
                        point: 10,
                        quiz: 'qqqq.com'
                    }]
                }
            ]
        }];
    let parsedRes = {
        type: 'grouped-weekly-quiz',
        version: '2.0.0',
        quizzes: {
            BQDC: {
                'sub-type': 'quiz-group',
                'id': 'BQDC',
                name: '根据汉语意思补全单词',
                quizzes: [
                    {
                        "point": 4,
                        "quiz": "/buzz-quiz/20170321-AH-B-1/index.html"
                    },
                    {
                        "point": 5,
                        "quiz": "/buzz-quiz/20170321-AH-B-2/index.html"
                    }, {
                        point: 9,
                        quiz: 'wwww.com',
                    }, {
                        point: 10,
                        quiz: 'qqqq.com'
                    }
                ]
            },
            test: {
                "sub-type": "quiz-group",
                "id": "test",
                "name": "另外一种测试",
                quizzes: [
                    {
                        point: 6,
                        "quiz": "another url"
                    }, {
                        point: 7,
                        quiz: "yet another url"
                    },
                    {
                        point: 7,
                        quiz: 'xxxx.com'
                    }, {
                        point: 8,
                        quiz: 'yyyy.com'
                    }
                ]
            }
        }
    };

    it('parses weekly quizzes', function () {
        expect(p.parse(jsonArray)).toEqual(parsedRes);
    });
});
