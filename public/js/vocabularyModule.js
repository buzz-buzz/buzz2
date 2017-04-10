angular.module('vocabularyModule', ['trackingModule', 'clientConfigModule', 'DateModule', 'quizModule', 'angularQueryParserModule', 'servicesModule'])
    .controller('vocabularyHeaderCtrl', ['$scope', 'DateFactory', function ($scope, DateFactory) {
        $scope.chineseWeekNumber = {
            1: '一',
            2: '二',
            3: '三',
            4: '四',
            5: '五'
        }[DateFactory.getWeekNumberOfMonth(new Date())];
    }])
    .controller('vocabularyCtrl', ['$scope', '$sce', 'tracking', 'clientConfig', '$http', 'Month', 'DateOfMonth', 'quizFactory', 'queryParser', '$q', 'httpPaginationData', function ($scope, $sce, tracking, clientConfig, $http, Month, DateOfMonth, quizFactory, queryParser, $q, paginationData) {
        tracking.sendX('myVocabulary');

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
            tracking.sendX('myVocabulary.printBtn.click');
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
                tracking.sendX(event, {
                    checked: false
                });
            } else {
                $scope.radioBoxType = type;
                tracking.sendX(event, {
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

        function sortByIndex(x, y) {
            var diff = x.index - y.index;

            if (diff > 0) return 1;
            if (diff < 0) return -1;
            return 0;
        }

        var newWordsCache = {};

        function getNewWords(path) {
            if (newWordsCache[path]) {
                return $q.resolve(newWordsCache[path]);
            }

            return $http.get(path).then(function (res) {
                newWordsCache[path] = res.data;

                return newWordsCache[path]
            });
        }

        function getWord(name){
            $http.get('/my/vocabulary?name='+name).
                 then(function(response){
                     return response;
            });
        }

        function mapToDisplayData(result) {
            $scope.vocabularyAll = [];
            result.map(function (course) {
                var date = new Date(course.date);

                $scope.vocabularyAll.push({
                    year: date.getFullYear(),
                    monthDay: Month[date.getMonth()] + '.' + DateOfMonth.getShortString(date.getDate()),
                    words: [],
                    lesson_id: course.lesson_id,
                    date: course.date,
                    category: course.category,
                    level: course.level
                });

                (function (v) {
                    $q.all([
                        getNewWords(course.new_words_path).then(function (res) {
                            for (var word in res.dictionary) {
                                if (word[0] === '_') {
                                    continue;
                                }
                                getWord("word").then(function(response){
                                    v.words.push({
                                        name: word,
                                        index: res.dictionary[word].id,
                                        ipc: response.phon-en + response.phon-us,
                                        explaination: response.explain,
                                        soundURL: res.dictionary[word].ipa,
                                        url: res.dictionary[word].url,
                                        exercise: res.dictionary[word].exercise
                                    });
                                });

                            }

                            v.words.sort(sortByIndex);

                            return v.words;
                        }),

                        quizFactory.getVocabularyPerformance({
                            lesson_id: course.lesson_id,
                        })
                    ]).then(function (results) {
                        parseVocabularyPerformance(results[0], results[1]);
                    });
                })($scope.vocabularyAll[$scope.vocabularyAll.length - 1]);
            });
        }

        $scope.vocabularyData = new paginationData(clientConfig.serviceUrls.buzz.courses.findByLevel.frontEnd.replace(':level', queryParser.get('level') || 'B'), {
            pageSize: 7
        }, {
            dataGotCallback: mapToDisplayData
        });
        $scope.vocabularyData.getNextPage();
    }]);