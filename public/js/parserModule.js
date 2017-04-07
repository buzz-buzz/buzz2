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
    .factory('quizParser', ['quizStatus', function (quizStatus) {
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

        quizParser.parse = function (json) {
            if (!json.version) {
                return quizParser.parseV1(json);
            }

            if (json.version[0] === '2') {
                return quizParser.parseV2(json);
            }

            throw new Error('unsupported quiz version "' + json.version + '" for now!');
        };

        return quizParser;
    }])
    .factory('vocabularyParser', ['vocabularyStatus', function (vocabularyStatus) {
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
            }
        };

        vocabularyParser.parse = vocabularyParser.parseV1;

        return vocabularyParser;
    }])
;