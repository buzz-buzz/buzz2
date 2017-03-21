angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule', 'quizModule'])
    .run(['$rootScope', 'tracking', 'queryParser', function ($rootScope, tracking, queryParser) {
        var query = queryParser.parse();
        tracking.send('play', {
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
                    lesson_id: result.data.lesson_id
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
                        .then(function (result) {
                            console.log(result);
                        });
                } catch (ex) {
                    console.error(ex);
                }
            }
        }, false);
    }])
    .controller('page2ParentCtrl', ['$scope', 'tracking', function ($scope, tracking) {
        $scope.$root.tabularIndex = 1;

        $scope.$watch('tabularIndex', function (newVal, oldVal) {
            switch (newVal) {
                case 1:
                    tracking.send('play.vocabularyTab.click');
                    break;
                case 2:
                    tracking.send('play.exerciseTab.click');
                    break;
                case 3:
                    tracking.send('play.quizTab.click');
                    break;
                default:
                    break;
            }
        });
    }])
    .controller('quizCtrl', ['$scope', '$http', 'queryParser', '$sce', '$window', 'clientConfig', '$rootScope', 'tracking', '$timeout', 'quizFactory', function ($scope, $http, queryParser, $sce, $window, clientConfig, $rootScope, tracking, $timeout, quizFactory) {
        $scope.$sce = $sce;
        $scope.quizURL = "";

        $scope.quizzes = [];
        $scope.quizIndex = 0;
        var STATUS = $scope.STATUS = {
            "U": "unchecked",
            "P": "passed",
            "F": "failed"
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
                    tracking.send('today-quiz', {
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
                        tracking.send('today-quiz.submit', {
                            index: $scope.quizIndex,
                            ispassed: ret.status.toLowerCase() === STATUS.P,
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
                var retArray = [];
                Object.keys(data).forEach(function (key) {
                    retArray.push({
                        "name": key,
                        "url": data[key],
                        "status": STATUS.U
                    });
                });
                $scope.quizzes = retArray;

                setUrl(true);

                $scope.itemClick = function (index) {
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
    .controller('newWordCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', '$window', 'tracking', 'clientConfig', '$rootScope', 'quizFactory', function ($scope, $http, queryParser, $timeout, $sce, $window, tracking, clientConfig, $rootScope, quizFactory) {

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

            tracking.send('today-vocabulary-' + trackingTarget, {
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
                            tracking.send('today-vocabulary-quiz.submit', {
                                word: word,
                                ispassed: ret.status.toLowerCase() === STATUS.P,
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

            var STATUS = $scope.STATUS = {
                "U": "unchecked",
                "P": "passed",
                "F": "failed"
            };
            $http.get(lessonData.new_words_path).then(function (ret) {
                if (!ret || !ret.data) {
                    return null;
                }
                var wordsData = ret.data;
                if (wordsData.dictionary) {
                    Object.keys(wordsData.dictionary).forEach(function (key) {
                        var thisWord = wordsData.dictionary[key];
                        $scope.newWords.push({
                            "word": key,
                            "id": thisWord.id,
                            "url": thisWord.url,
                            "exercise": thisWord.exercise || "",
                            "status": STATUS.U
                            // "exercise": thisWord.exercise || "http://content.bridgeplus.cn/buzz-quiz/" + query.date + '-' + query.level + "/index.html"
                        });
                    });
                }
                $scope.WORD_MAX_INDEX = $scope.newWords.length - 1;
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
            };
            $scope.turnWord = function (isNext) {
                if (!shouldDoAction()) {
                    return;
                }
                if (isNext) {
                    tracking.send('play.vocabularyTab.slideNextBtn.clicked');
                } else {
                    tracking.send('play.vocabularyTab.slidePrevBtn.clicked');
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
    .controller('weeklyQuizCtrl', ['$scope', function ($scope) {
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
        console.log('event will be listen');
    }])
;
