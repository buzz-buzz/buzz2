angular.module('buzzModule')
    .controller('newWordCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', '$window', 'trackingX', 'clientConfig', '$rootScope', 'quizFactory', 'api', 'vocabularyParser', 'vocabularyStatus', function ($scope, $http, queryParser, $timeout, $sce, $window, tracking, clientConfig, $rootScope, quizFactory, api, vocabularyParser, vocabularyStatus) {
        var modalId = '#login';
        $scope.$sce = $sce;
        $scope.newWords = [];
        $scope.word = {};
        $scope.firstExercise = false;

        var wordIndex = $scope.wordIndex = undefined;

        $scope.currentVocabulary = {};

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

        function switchSide() {
            return $scope.side !== "a" ? "a" : "b";
        }

        function lockActionAndUnlockItLater() {
            $scope.actionLock = true;

            $timeout(function () {
                $scope.actionLock = false;
                $scope.animateDirection = "";
            }, 1100);
        }

        function lessonDataGot(event, lessonData) {
            $scope.side = "";
            $scope.initStatus = "";
            $scope.animateDirection = "";

            $rootScope.$on('answer:vocabulary', function (event, ret) {
                if (($scope.wordIndex + 1) == 1 && !$scope.firstExercise) {
                    $scope.firstExercise = true;
                } else if (($scope.wordIndex + 1) == 1) {
                    return;
                }

                quizFactory.saveResult({
                    lesson_id: lessonData.lesson_id,
                    type: 'vocabulary',
                    result_id: ($scope.wordIndex + 1).toString(),
                    total: $scope.newWords.length,
                    wrong: ret.status === 'Failed' ? 1 : 0,
                    correct: ret.status === 'Passed' ? 1 : 0,
                    detail: {
                        title: String(ret.title),
                        score: String(ret.mark),
                        status: String(ret.status)
                    }
                });

                api.get(clientConfig.serviceUrls.buzz.profile.memberVocabularies.frontEnd + '?word=' + $scope.newWords[$scope.wordIndex].word + '&answer=' + ret.status).then(function (data) {
                    console.log(data);
                });

                tracking.sendX('today-vocabulary-quiz.submit', {
                    word: $scope.newWords[$scope.wordIndex].word,
                    ispassed: ret.status.toLowerCase() === vocabularyStatus.pass,
                    score: ret.mark
                });

                var status = ret.status;
                $scope.newWords[$scope.wordIndex].status = status.toLowerCase();
            });

            var seturl = function (options) {
                setInitStatus();

                var word = $scope.newWords[$scope.wordIndex].word;
                track(options.isQuiz, word);
                $scope.side = switchSide();
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

                wordIndex = $scope.wordIndex = 0;
                if ($scope.newWords[wordIndex].exercise && $scope.newWords[wordIndex].exercise !== "") {
                    $scope.isWordMode = false;
                    if ($scope.newWords[wordIndex].url && $scope.newWords[wordIndex].url !== "") {
                        $scope.hasWordMode = true;
                    } else {
                        $scope.hasWordMode = false;
                    }
                    seturl({
                        url: $scope.newWords[wordIndex].exercise,
                        isQuiz: true
                    });
                } else {
                    $scope.isWordMode = true;
                    $scope.hasWordMode = false;
                    seturl({
                        url: $scope.newWords[wordIndex].url,
                        isQuiz: false
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
                                isQuiz: true
                            });
                        } else {
                            $scope.hasWordMode = false;
                            $scope.isWordMode = true;
                            seturl({
                                url: $scope.newWords[wordIndex].url,
                                isQuiz: false
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
                        isQuiz: true
                    });
                } else {
                    $scope.hasWordMode = false;
                    $scope.isWordMode = true;
                    seturl({
                        url: $scope.newWords[wordIndex].url,
                        isQuiz: false
                    });
                }
            };

            $scope.changeWordMode = function (isWordMode) {
                if (!shouldDoAction()) {
                    return;
                }

                seturl({
                    url: isWordMode ? $scope.newWords[wordIndex].url : $scope.newWords[wordIndex].exercise,
                    isQuiz: !isWordMode
                });

                $scope.isWordMode = isWordMode;
                $scope.animateDirection = isWordMode ? "btom" : "ttom";

                updateUrl();
            };
        }

        if ($rootScope.lessonData) {
            lessonDataGot(null, $rootScope.lessonData);
        } else {
            var unbind = $rootScope.$on('lessonInfo:got', lessonDataGot);
            $scope.$on('$destroy', unbind);
        }

        function getUrl() {
            return $scope.isWordMode ? $scope.newWords[$scope.wordIndex].url : $scope.newWords[$scope.wordIndex].exercise;

        }

        function updateUrl() {
            $scope.currentVocabulary = {
                url: getUrl()
            };
        }

        $scope.$watch('wordIndex', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                updateUrl();
            }
        });

        $scope.$watch('currentVocabulary.url', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $('#vocabulary-frame.ui.embed').embed('change', 'vocabulary-frame', newValue);
                });
            }
        });
    }])
    ;