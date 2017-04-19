angular.module('buzzModule')
    .controller('quizCtrl', ['$scope', '$http', 'queryParser', '$sce', '$window', 'clientConfig', '$rootScope', 'tracking', '$timeout', 'quizFactory', 'api', 'quizParser', 'quizStatus', '$rootScope', function ($scope, $http, queryParser, $sce, $window, clientConfig, $rootScope, tracking, $timeout, quizFactory, api, quizParser, quizStatus, $rootScope) {
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

            $rootScope.$on('answer:daily-exercise', function (event, ret) {
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

                tracking.sendX('today-quiz.submit', {
                    index: $scope.quizIndex,
                    ispassed: ret.status.toLowerCase() === quizStatus.pass,
                    score: ret.mark
                });
            });

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
                        var status = ret.status;
                        $scope.quizzes[$scope.quizIndex].status = status.toLowerCase();

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
;