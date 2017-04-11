angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule', 'quizModule', 'serviceCacheModule', 'wechatShareModule', 'parserModule', 'DateModule'])
    .run(['$rootScope', 'tracking', 'queryParser', function ($rootScope, tracking, queryParser) {
        var query = queryParser.parse();
        tracking.sendX('play', {
            date: query.date,
            category: query.cat,
            level: query.level
        });
    }])
    .controller('VideoPlayerCtrl', ['$scope', '$sce', 'clientConfig', '$http', 'queryParser', '$rootScope', function ($scope, $sce, clientConfig, $http, queryParser, $rootScope) {
        function getLesson() {
            var query = queryParser.parse();

            return $http.get(clientConfig.serviceUrls.buzz.courses.findByDate.frontEnd.replace(':category', query.cat).replace(':level', query.level).replace(':date', query.date));
        }

        getLesson()
            .then(function (result) {
                $scope.queryString = location.search + '&video_path=' + (result.data.video_path) + '&new_words_path=' + result.data.new_words_path + '&lesson_id=' + result.data.lesson_id;

                $scope.src = '/s/player' + $scope.queryString;

                $rootScope.lessonInfo = {
                    video_path: result.data.video_path,
                    quiz_path: result.data.quiz_path,
                    new_words_path: result.data.new_words_path,
                    lesson_id: result.data.lesson_id,
                    enabled: result.data.enabled
                };

                $scope.$emit('lessonInfo:got', $rootScope.lessonInfo);
            })
        ;
        $scope.$sce = $sce;
    }])
    .controller('UpdateHitsCtrl', ['$scope', 'clientConfig', '$http', function ($scope, clientConfig, $http) {
        window.addEventListener('message', function (event) {
            if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('video:played//') === 0) {
                try {
                    var data = JSON.parse(event.data.substr(14));
                    $http
                        .post(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', data.category).replace(':level', data.level).replace(':lesson_id', data.lesson_id), {})
                    ;
                } catch (ex) {
                    console.error(ex);
                }
            }
        }, false);
    }])
    .controller('page2ParentCtrl', ['$scope', 'tracking', function ($scope, tracking) {
        $scope.$root.tabularIndex = 0;
        //如果是PC端  初始值为1
        if (!navigator.userAgent.match(/(iPhone|iPod|Android|ios|Windows Phone)/i)) {
            $scope.$root.tabularIndex = 1;
        }
        console.log("gator:" + navigator.userAgent);

        $scope.$watch('tabularIndex', function (newVal, oldVal) {
            switch (newVal) {
                case 1:
                    tracking.sendX('play.vocabularyTab.click');
                    break;
                case 2:
                    tracking.sendX('play.exerciseTab.click');
                    break;
                case 3:
                    tracking.sendX('play.quizTab.click');
                    break;
                default:
                    break;
            }
        });

        $scope.tagToggle = function (index) {
            //如果是当前页 就关闭
            if ($scope.$root.tabularIndex == index) {
                $scope.$root.tabularIndex = 0;
            } else { //否则 打开当前页
                $scope.$root.tabularIndex = index;
            }
        };
    }])
    .controller('quizCtrl', ['$scope', '$http', 'queryParser', '$sce', '$window', 'clientConfig', '$rootScope', 'tracking', '$timeout', 'quizFactory', 'api', 'quizParser', 'quizStatus', function ($scope, $http, queryParser, $sce, $window, clientConfig, $rootScope, tracking, $timeout, quizFactory, api, quizParser, quizStatus) {
        var modalId = '#login';
        $scope.$sce = $sce;
        $scope.quizURL = "";

        $scope.quizzes = [];
        $scope.quizIndex = 0;
        $scope.STATUS = {
            "U": quizStatus.unchecked,
            "P": quizStatus.pass,
            "F": quizStatus.failed
        };

        function lessonDataGot(event, lessonData) {
            $scope.currentID = "";
            $scope.initStatus = "";
            $scope.animateDirection = "";
            var getNextId = function () {
                if ($scope.currentID != "quiz-1") {
                    $scope.currentID = "quiz-1";
                } else {
                    $scope.currentID = "quiz-2";
                }
                return $scope.currentID;
            };
            var setUrl = function (forcerefresh) {
                if ($scope.initStatus === "") {
                    $scope.initStatus = "true";
                } else {
                    $scope.initStatus = "false";
                }
                if ($window.quizAdapter) {
                    tracking.sendX('today-quiz', {
                        index: $scope.quizIndex
                    });
                    $window.quizAdapter.getResult(getNextId(), $scope.quizzes[$scope.quizIndex].url, forcerefresh).then(function (ret) {
                        quizFactory.saveResult({
                            lesson_id: lessonData.lesson_id,
                            type: 'daily-exercise',
                            result_id: $scope.quizIndex.toString(),
                            total: $scope.quizzes.length,
                            wrong: ret.status === 'Failed' ? 1 : 0,
                            correct: ret.status === 'Passed' ? 1 : 0,
                            detail: {
                                title: String(ret.title),
                                score: String(ret.mark),
                                status: String(ret.status)
                            }
                        });

                        var status = ret.status;
                        $scope.quizzes[$scope.quizIndex].status = status.toLowerCase();
                        tracking.sendX('today-quiz.submit', {
                            index: $scope.quizIndex,
                            ispassed: ret.status.toLowerCase() === quizStatus.pass,
                            score: ret.mark
                        });
                    }, function () {
                        //Do nothing
                    });
                }
            };
            $scope.actionLock = false;
            var doAction = function () {
                var ret = true;
                if ($scope.actionLock) {
                    ret = false;
                } else {
                    $scope.actionLock = true;
                    $timeout(function () {
                        $scope.actionLock = false;
                        $scope.animateDirection = "";
                    }, 1100);
                }
                return ret;
            };

            $http.get(lessonData.quiz_path).then(function (ret) {
                var data = ret.data;
                $scope.quizzes = quizParser.parse(data);
                $scope.quizLimit = $scope.quizzes.length - 1;
                api.get(clientConfig.serviceUrls.buzz.quiz.limit).then(function (result) {
                    if (result.data) {
                        $scope.quizLimit = Number(result.data) - 1;
                    }
                });

                setUrl(true);

                $scope.itemClick = function (index) {
                    api.get(clientConfig.serviceUrls.buzz.quiz.limit).then(function (result) {
                        if (!result.data || (Number(result.data) - 1 >= index)) {
                            if (!doAction()) {
                                return;
                            }
                            if ($scope.quizIndex !== index) {
                                if ($scope.quizIndex > index) {
                                    $scope.animateDirection = "ltom";
                                } else {
                                    $scope.animateDirection = "rtom";
                                }
                                $scope.quizIndex = index;
                                setUrl(true);
                            }
                        } else {
                            $rootScope.$emit('modal:show' + modalId);
                        }
                    });
                };
                $scope.turnQuiz = function (isNext) {
                    if (!doAction()) {
                        return;
                    }
                    var maxIndex = $scope.quizzes.length - 1;
                    if (isNext) {
                        $scope.quizIndex++;
                        $scope.animateDirection = "rtom";
                    } else {
                        $scope.quizIndex--;
                        $scope.animateDirection = "ltom";
                    }
                    if ($scope.quizIndex > maxIndex) {
                        $scope.quizIndex = maxIndex;
                    } else if ($scope.quizIndex < 0) {
                        $scope.quizIndex = 0;
                    }
                    // if ($scope.quizIndex===2) {
                    //     $scope.quizzes[$scope.quizIndex].status=STATUS.P;
                    // }
                    // if ($scope.quizIndex===3) {
                    //     $scope.quizzes[$scope.quizIndex].status=STATUS.F;
                    // }
                    setUrl(true);
                };
            });
        }

        if ($rootScope.lessonData) {
            lessonDataGot(null, $rootScope.lessonData);
        } else {
            var unbind = $rootScope.$on('lessonInfo:got', lessonDataGot);
            $scope.$on('$destroy', unbind);
        }
    }])
    .controller('newWordCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', '$window', 'tracking', 'clientConfig', '$rootScope', 'quizFactory', 'api', 'vocabularyParser', 'vocabularyStatus', function ($scope, $http, queryParser, $timeout, $sce, $window, tracking, clientConfig, $rootScope, quizFactory, api, vocabularyParser, vocabularyStatus) {
        var modalId = '#login';
        $scope.$sce = $sce;
        $scope.newWords = [];
        $scope.word = {};
        var wordIndex = $scope.wordIndex = 0;

        function setInitStatus() {
            if ($scope.initStatus === "") {
                $scope.initStatus = "true";
            } else {
                $scope.initStatus = "false";
            }
        }

        function track(isQuiz, word) {
            var trackingTarget = isQuiz ? 'quiz' : 'word';

            tracking.sendX('today-vocabulary-' + trackingTarget, {
                word: word
            });
        }

        function getCurrentId() {
            return $scope.currentID != "word-1" ? "word-1" : "word-2";
        }

        function lockActionAndUnlockItLater() {
            $scope.actionLock = true;

            $timeout(function () {
                $scope.actionLock = false;
                $scope.animateDirection = "";
            }, 1100);
        }

        function lessonDataGot(event, lessonData) {
            $scope.currentID = "";
            $scope.initStatus = "";
            $scope.animateDirection = "";

            var seturl = function (options) {
                setInitStatus();

                if ($window.quizAdapter) {
                    var word = $scope.newWords[$scope.wordIndex].word;
                    track(options.isQuiz, word);
                    $scope.currentID = getCurrentId();

                    $window.quizAdapter
                        .getResult($scope.currentID, options.url, options.forceRefresh)
                        .then(function resultGot(ret) {
                            quizFactory.saveResult({
                                lesson_id: lessonData.lesson_id,
                                type: 'vocabulary',
                                result_id: $scope.wordIndex.toString(),
                                total: $scope.newWords.length,
                                wrong: ret.status === 'Failed' ? 1 : 0,
                                correct: ret.status === 'Passed' ? 1 : 0,
                                detail: {
                                    title: String(ret.title),
                                    score: String(ret.mark),
                                    status: String(ret.status)
                                }
                            });

                            var status = ret.status;
                            $scope.newWords[$scope.wordIndex].status = status.toLowerCase();
                            tracking.sendX('today-vocabulary-quiz.submit', {
                                word: word,
                                ispassed: ret.status.toLowerCase() === vocabularyStatus.pass,
                                score: ret.mark
                            });
                        });
                }
            };

            $scope.actionLock = false;
            var shouldDoAction = function () {
                if ($scope.actionLock) {
                    return false;
                }

                lockActionAndUnlockItLater();
                return true;
            };

            $scope.STATUS = {
                "U": vocabularyStatus.unchecked,
                "P": vocabularyStatus.pass,
                "F": vocabularyStatus.failed
            };
            $http.get(lessonData.new_words_path).then(function (ret) {
                if (!ret || !ret.data) {
                    return null;
                }
                $scope.newWords = vocabularyParser.parse(ret.data);
                $scope.WORD_MAX_INDEX = $scope.newWords.length - 1;

                api.get(clientConfig.serviceUrls.buzz.quiz.limit).then(function (result) {
                    if (result.data) {
                        $scope.WORD_MAX_INDEX = Number(result.data) - 1;
                    }
                });

                if ($scope.newWords[wordIndex].exercise && $scope.newWords[wordIndex].exercise !== "") {
                    $scope.isWordMode = false;
                    if ($scope.newWords[wordIndex].url && $scope.newWords[wordIndex].url !== "") {
                        $scope.hasWordMode = true;
                    } else {
                        $scope.hasWordMode = false;
                    }
                    seturl({
                        url: $scope.newWords[wordIndex].exercise,
                        isQuiz: true,
                        forceRefresh: true
                    });
                } else {
                    $scope.isWordMode = true;
                    $scope.hasWordMode = false;
                    seturl({
                        url: $scope.newWords[wordIndex].url,
                        isQuiz: false,
                        forceRefresh: true
                    });

                }
            });

            $scope.itemClick = function (index) {
                api.get(clientConfig.serviceUrls.buzz.quiz.limit).then(function (result) {
                    if (!result.data || (Number(result.data) - 1 >= index)) {
                        if (!shouldDoAction()) {
                            return;
                        }
                        if ($scope.wordIndex < index) {
                            $scope.animateDirection = "rtom";
                        } else if ($scope.wordIndex > index) {
                            $scope.animateDirection = "ltom";
                        } else {
                            return;
                        }
                        $scope.wordIndex = wordIndex = index;
                        if ($scope.newWords[wordIndex].exercise && $scope.newWords[wordIndex].exercise !== "") {
                            $scope.isWordMode = false;
                            if ($scope.newWords[wordIndex].url && $scope.newWords[wordIndex].url !== "") {
                                $scope.hasWordMode = true;
                            } else {
                                $scope.hasWordMode = false;
                            }
                            seturl({
                                url: $scope.newWords[wordIndex].exercise,
                                isQuiz: true,
                                forceRefresh: true
                            });
                        } else {
                            $scope.hasWordMode = false;
                            $scope.isWordMode = true;
                            seturl({
                                url: $scope.newWords[wordIndex].url,
                                isQuiz: false,
                                forceRefresh: true
                            });
                        }
                    } else {
                        $rootScope.$emit('modal:show' + modalId);
                    }
                });
            };
            $scope.turnWord = function (isNext) {
                if (!shouldDoAction()) {
                    return;
                }
                if (isNext) {
                    tracking.sendX('play.vocabularyTab.slideNextBtn.clicked');
                } else {
                    tracking.sendX('play.vocabularyTab.slidePrevBtn.clicked');
                }

                var length = $scope.newWords.length;
                if (isNext) {
                    ++wordIndex;
                    $scope.animateDirection = "rtom";
                } else {
                    --wordIndex;
                    $scope.animateDirection = "ltom";
                }
                if (wordIndex >= length) {
                    wordIndex = length - 1;
                } else if (wordIndex < 0) {
                    wordIndex = 0;
                }
                $scope.wordIndex = wordIndex;
                if ($scope.newWords[wordIndex].exercise && $scope.newWords[wordIndex].exercise !== "") {
                    $scope.isWordMode = false;
                    if ($scope.newWords[wordIndex].url && $scope.newWords[wordIndex].url !== "") {
                        $scope.hasWordMode = true;
                    } else {
                        $scope.hasWordMode = false;
                    }
                    seturl({
                        url: $scope.newWords[wordIndex].exercise,
                        isQuiz: true,
                        forceRefresh: true
                    });
                } else {
                    $scope.hasWordMode = false;
                    $scope.isWordMode = true;
                    seturl({
                        url: $scope.newWords[wordIndex].url,
                        isQuiz: false,
                        forceRefresh: true
                    });
                }
            };

            $scope.changeWordMode = function (isWordMode) {
                if (!shouldDoAction()) {
                    return;
                }

                seturl({
                    url: isWordMode ? $scope.newWords[wordIndex].url : $scope.newWords[wordIndex].exercise,
                    isQuiz: !isWordMode,
                    forceRefresh: false
                });

                $scope.isWordMode = isWordMode;
                $scope.animateDirection = isWordMode ? "btom" : "ttom";
            };
        }

        if ($rootScope.lessonData) {
            lessonDataGot(null, $rootScope.lessonData);
        } else {
            var unbind = $rootScope.$on('lessonInfo:got', lessonDataGot);
            $scope.$on('$destroy', unbind);
        }
    }])
    .controller('weeklyQuizTabCtrl', ['$scope', 'BuzzCalendar', 'queryParser', function ($scope, BuzzCalendar, queryParser) {
        var query = queryParser.parse();
        var now = query.today ? new Date(query.today) : new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var thisWeekDates = BuzzCalendar.getDatesOfThisWeek(today);

        if (thisWeekDates[thisWeekDates.length - 2] <= today) {
            $scope.showWeeklyQuiz = true;
        } else {
            $scope.showWeeklyQuiz = false;
        }
    }])
    .controller('weeklyQuizCtrl', ['$scope', 'BuzzCalendar', 'queryParser', 'api', 'clientConfig', 'weeklyQuizParser', '$q', '$window', function ($scope, BuzzCalendar, queryParser, api, clientConfig, weeklyQuizParser, $q, $window) {
        var query = queryParser.parse();
        var now = query.today ? new Date(query.today) : new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        api.get(clientConfig.serviceUrls.buzz.courses.search.frontEnd, {
            params: {
                date: {
                    start: BuzzCalendar.getFirstDateOfWeek(today).toLocaleDateString(),
                    end: BuzzCalendar.getFirstDateOfNextWeek(today).toLocaleDateString()
                }
            }
        }).then(function (result) {
            return result.data.map(function (lesson) {
                return api.get(lesson.quiz_path);
            });
        }).then(function (quizRequests) {
            return $q.all(quizRequests);
        }).then(function (quizResponses) {
            return quizResponses.map(function (r) {
                return r.data;
            });
        }).then(function (jsonArray) {
            $scope.weeklyQuiz = weeklyQuizParser.parse(jsonArray);

            console.log($scope.weeklyQuiz);

            if ($window.quizAdapter) {
                $window.quizAdapter.getResult('weekly-quiz-1', $scope.weeklyQuiz.quizzes.BQDC.quizzes[0].quiz);
            }
        });
    }])
    .controller('loginModalCtrl', ['$scope', 'modalFactory', '$rootScope', function ($scope, modalFactory, $rootScope) {
        var modalId = '#login';
        modalFactory.bootstrap($scope, $rootScope, modalId);
        window.addEventListener('message', function (event) {
            if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('video:restricted//') === 0) {
                try {
                    $rootScope.$emit('modal:show' + modalId);
                } catch (ex) {
                    console.error(ex);
                }
            }
        }, false);
    }])
    .controller('auditModalCtrl', ['$scope', '$rootScope', 'modalFactory', function ($scope, $rootScope, modalFactory) {
        modalFactory.bootstrap($scope, $rootScope, '#audit-modal');

        $rootScope.$watch('lessonInfo', function (newValue, oldValue) {
            if (newValue && !newValue.enabled) {
                $scope.showTheModal();
            }
        });
    }])
;
