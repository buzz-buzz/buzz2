angular.module('parserModule', [])
    .value('quizStatus', {
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

;