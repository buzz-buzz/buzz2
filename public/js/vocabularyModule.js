angular.module('vocabularyModule', ['trackingModule', 'clientConfigModule', 'DateModule', 'quizModule', 'angularQueryParserModule'])
    .controller('vocabularyCtrl', ['$scope', '$sce', 'tracking', 'clientConfig', '$http', 'Month', 'DateOfMonth', 'quizFactory', 'queryParser', '$q', function ($scope, $sce, tracking, clientConfig, $http, Month, DateOfMonth, quizFactory, queryParser, $q) {
        tracking.send('myVocabulary');

        $scope.printMode = false;
        $scope.printURL = "";
        var RADIO_TYPE = $scope.RADIO_TYPE = {
            "NONE": "none",
            "PASS": "Passed",
            "FAIL": "Failed",
            "NOTTEST": "nottest"
        };
        $scope.radioBoxType = RADIO_TYPE.NONE;
        $scope.$sce = $sce;
        var PRINT_URL_PREFIX = "/vocabulary/print?";
        var wordsToPrint = {};
        for (var key in RADIO_TYPE) {
            wordsToPrint[RADIO_TYPE[key]] = [];
        }
        $scope.vocabularyPrint = function () {
            tracking.send('myVocabulary.printBtn.click');
            $scope.printMode = true;
            var content = encodeURIComponent(wordsToPrint[$scope.radioBoxType].slice(","));
            $scope.printURL = PRINT_URL_PREFIX + content;
        };
        $scope.hidePopup = function () {
            $scope.printMode = false;
            $scope.printURL = "";
        };
        $scope.checkboxClick = function (type) {
            var event;

            switch (type) {
                case RADIO_TYPE.FAIL:
                    event = 'myVocabulary.notUnderstoodBtn.click';
                    break;
                case RADIO_TYPE.PASS:
                    event = 'myVocabulary.understoodBtn.click';
                    break;
                case RADIO_TYPE.NOTTEST:
                    event = 'myVocabulary.notPracticeBtn.click';
                    break;
                default:
                    break;
            }

            if (type === $scope.radioBoxType) {
                $scope.radioBoxType = RADIO_TYPE.NONE;
                tracking.send(event, {
                    checked: false
                });
            } else {
                $scope.radioBoxType = type;
                tracking.send(event, {
                    checked: true
                });
            }
        };
        $scope.vocabularyAll = [];

        function parseVocabularyPerformance(words, performances) {
            words.map(function (w) {
                wordsToPrint[RADIO_TYPE.NONE].push(w.name);

                var perf = performances.filter(function (p) {
                    return p.result_id == w.index;
                });

                if (!perf || perf.length <= 0) {
                    w.status = RADIO_TYPE.NOTTEST;

                    wordsToPrint[RADIO_TYPE.NOTTEST].push(w.name);
                }

                perf.filter(function (p) {
                    return p.key === 'status';
                }).map(function (p) {
                    w.status = p.value;
                    wordsToPrint[w.status].push(w.name);
                });
            });
        }

        $http.get(clientConfig.serviceUrls.buzz.courses.findByLevel.frontEnd.replace(':level', queryParser.get('level') || 'B'))
            .then(function (result) {
                $scope.vocabularyAll = [];
                result.data.map(function (course) {
                    var date = new Date(course.date);

                    $scope.vocabularyAll.push({
                        year: date.getFullYear(),
                        monthDay: Month[date.getMonth()] + '.' + DateOfMonth.getShortString(date.getDate()),
                        words: [],
                        lesson_id: course.lesson_id
                    });

                    (function (v) {
                        $q.all([
                            $http.get(course.new_words_path).then(function (result) {
                                for (var word in result.data.dictionary) {
                                    v.words.push({
                                        name: word,
                                        index: result.data.dictionary[word].id,
                                        ipc: result.data.dictionary[word].ipc,
                                        explaination: result.data.dictionary[word].explanation,
                                        soundURL: result.data.dictionary[word].ipa,
                                        url: result.data.dictionary[word].url,
                                        exercise: result.data.dictionary[word].exercise
                                    });
                                }

                                v.words.sort(function (x, y) {
                                    var diff = x.index - y.index;

                                    if (diff > 0) return 1;
                                    if (diff < 0) return -1;
                                    return 0;
                                });

                                return v.words;
                            }),

                            quizFactory.getVocabularyPerformance({
                                lesson_id: course.lesson_id,
                            })
                        ]).then(function (results) {
                            parseVocabularyPerformance(results[0], results[1].data);
                        });


                    })($scope.vocabularyAll[$scope.vocabularyAll.length - 1]);
                });
            })
        ;
    }]);