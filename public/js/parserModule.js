angular.module('parserModule', [])
    .value('quizStatus', {
        "unchecked": "unchecked",
        "pass": "passed",
        "failed": "failed"
    })
    .value('vocabularyStatus', {
        "unchecked": "unchecked",
        "pass": "passed",
        "failed": "failed"
    })
    .value('generateParse', function (parser) {
        return function (json) {
            if (!json.version) {
                return parser.parseV1(json);
            }

            if (json.version[0] === '2') {
                return parser.parseV2(json);
            }

            throw new Error('unsupported ' + json.type + ' version "' + json.version + '" for now!');
        };
    })
    .factory('quizParser', ['quizStatus', 'generateParse', function (quizStatus, generateParse) {
        var quizParser = {
            parseV1: function (json) {
                var retArray = [];

                Object.keys(json).forEach(function (key) {
                    retArray.push({
                        "name": key,
                        "url": json[key],
                        "status": quizStatus.unchecked
                    });
                });

                return retArray;
            },

            parseV2: function (json) {
                return json.quizzes.map(function (q, i) {
                    return {
                        name: 'quiz' + (i + 1),
                        url: q.quiz,
                        status: quizStatus.unchecked
                    };
                });
            }
        };

        quizParser.parse = generateParse(quizParser);

        return quizParser;
    }])
    .factory('vocabularyParser', ['vocabularyStatus', 'generateParse', function (vocabularyStatus, generateParse) {
        var vocabularyParser = {
            parseV1: function (json) {
                var newWords = [];

                Object.keys(json.dictionary).forEach(function (key) {
                    var thisWord = json.dictionary[key];

                    newWords.push({
                        "word": key,
                        "id": thisWord.id,
                        "url": thisWord.url,
                        "exercise": thisWord.exercise || "",
                        "status": vocabularyStatus.unchecked
                    });
                });

                return newWords;
            },

            parseV2: function (json) {
                return json.words.map(function (w, i) {
                    return {
                        word: w.word,
                        id: i + 1,
                        url: w.explain,
                        exercise: w.exercise || '',
                        status: vocabularyStatus.unchecked
                    };
                }).concat([{
                    word: '_match_',
                    id: json.words.length + 1,
                    url: undefined,
                    exercise: json.match.exercise,
                    status: vocabularyStatus.unchecked
                }]);
            }
        };

        vocabularyParser.parse = generateParse(vocabularyParser);

        return vocabularyParser;
    }])
;