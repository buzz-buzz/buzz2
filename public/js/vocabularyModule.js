angular.module('vocabularyModule', ['trackingModule', 'clientConfigModule', 'DateModule', 'quizModule', 'angularQueryParserModule', 'servicesModule', 'buzzHeaderModule'])
    .controller('vocabularyHeaderCtrl', ['$scope', 'DateFactory', function ($scope, DateFactory) {
        $scope.chineseWeekNumber = {
            1: '一',
            2: '二',
            3: '三',
            4: '四',
            5: '五'
        }[DateFactory.getWeekNumberOfMonth(new Date())];
    }])
    .controller('vocabularyCtrl', ['$scope', '$sce', 'trackingX', 'clientConfig', '$http', 'Month', 'DateOfMonth', 'quizFactory', 'queryParser', '$q', 'httpPaginationData', 'api', '$httpParamSerializer', function ($scope, $sce, trackingX, clientConfig, $http, Month, DateOfMonth, quizFactory, queryParser, $q, paginationData, api, $httpParamSerializer) {
        trackingX.sendX('myVocabulary');

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
            trackingX.sendX('myVocabulary.printBtn.click');
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
                trackingX.sendX(event, {
                    checked: false
                });
            } else {
                $scope.radioBoxType = type;
                trackingX.sendX(event, {
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


        function queryVocabularyExplanation(v) {
            api.get('/dict/' + v.name.replace(' ', '_') + '/index.json').then(function (detail) {
                if (detail.data) {
                    v.ipc_gb = detail.data['phon-gb'] ? '[英]' + detail.data['phon-gb'] : '';
                    v.ipc_us = detail.data['phon-us'] ? '[美]' + detail.data['phon-us'] : '';
                    v.explanation = detail.data.class + ' ' + detail.data.explain;
                }
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
                                v.words.push({
                                    name: word,
                                    index: res.dictionary[word].id,
                                    ipc_gb: "",
                                    ipc_us: "",
                                    explanation: '',
                                    soundURL: res.dictionary[word].ipa,
                                    url: res.dictionary[word].url,
                                    exercise: res.dictionary[word].exercise
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
                        return results;
                    }).then(function (results) {
                        results[0].map(function (v) {
                            queryVocabularyExplanation(v);
                        });
                    });
                })($scope.vocabularyAll[$scope.vocabularyAll.length - 1]);
            });
        }

        var query = queryParser.parse();
        if (!query.level) {
            query.level = 'B';
        }

        if (!query.enabled) {
            query.enabled = true;
        }

        if (!query.date) {
            query.date = { end: new Date(2022, 1, 1).toISOString() };
        }

        var url = clientConfig.serviceUrls.buzz.courses.search.frontEnd + '?' + $httpParamSerializer(query);

        $scope.vocabularyData = new paginationData({
            sourceUrl: url,
            queryData: {
                pageSize: 7
            },
            dataGotCallback: mapToDisplayData,
            dataField: 'rows'
        });
        $scope.vocabularyData.pageSize = 7;
        $scope.vocabularyData.getNextPage();

        //hank
        function bottomUpwardSlidingDo(callback) {
            var start, end, slideNum, winH, bodyH,
                bodyEle = document.querySelector("body"),
                docEle = document.documentElement,
                UA = navigator.userAgent,
                isUC = UA.indexOf("UCBrowser") != -1 || UA.indexOf("Baidu") != -1 || UA.indexOf("MQQBrowser") != -1,
                _h,
                _hStart;
            slideNum = isUC ? 6 : 60;
            document.addEventListener("touchstart", touchStartHandle, false);
            !isUC && document.addEventListener("touchend", touchEndHandle, false);
            function touchStartHandle(evt) {
                clearTimeout(_hStart);
                _hStart = setTimeout(function () {
                    start = evt.touches[0].pageY;
                }, 0);
            }

            isUC && document.addEventListener("touchmove", function (evt) {
                clearTimeout(_h);
                _h = setTimeout(function () {
                    touchEndHandle(evt)
                }, 0);

            }, false);
            function touchEndHandle(evt) {
                end = evt.changedTouches[0].pageY;
                if (start - end > slideNum) {
                    var scrollTop = bodyEle.scrollTop;
                    winH = docEle.clientHeight;
                    bodyH = docEle.scrollHeight;
                    scrollTop + winH + 1 >= bodyH && callback();
                }
            }
        }

        bottomUpwardSlidingDo(function () {
            $scope.vocabularyData.getNextPage();
            document.body.scrollTop = 0;
        });
    }]);