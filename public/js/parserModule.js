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
            parse: function () {
            }
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

        return vocabularyParser;
    }])
;