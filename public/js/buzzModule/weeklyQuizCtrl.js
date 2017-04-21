angular.module('buzzModule')

    .controller('weeklyQuizTabCtrl', ['$scope', 'BuzzCalendar', 'queryParser', '$rootScope', function ($scope, BuzzCalendar, queryParser, $rootScope) {
        var query = queryParser.parse();
        var now = query.today ? new Date(query.today) : new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var thisWeekDates = BuzzCalendar.getDatesOfThisWeek(today);

        if (thisWeekDates[thisWeekDates.length - 2] <= today) {
            $scope.showWeeklyQuiz = true;
        } else {
            hideWeeklyQuiz();
        }

        $rootScope.$on('weekly-quiz:hide', hideWeeklyQuiz);

        function hideWeeklyQuiz() {
            $scope.showWeeklyQuiz = false;

            if ($scope.$root.tabularIndex === 3) {
                $scope.$root.tabularIndex = 2;
            }
        }
    }])
    .controller('weeklyQuizCtrl', ['$scope', 'BuzzCalendar', 'queryParser', 'api', 'clientConfig', 'weeklyQuizParser', 'arrayWeeklyQuizParser', '$q', 'quizFactory', '$rootScope', function ($scope, BuzzCalendar, queryParser, api, clientConfig, weeklyQuizParser, arrayWeeklyQuizParser, $q, quizFactory, $rootScope) {
        var query = queryParser.parse();
        var now = query.today ? new Date(query.today) : new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        $scope.weeklyStatus = 'menu';
        $scope.turnTo = function (sta) {
            if (sta === 'grade') {
                quizFactory.clearWeeklyQuizScoreCache($scope.weeklyLessonId);
                calculateScore();
            }
            $scope.weeklyStatus = sta;
        };

        $scope.weeklyLessonId = null;
        $scope.score = 0;
        $scope.total_sum = 0;
        $scope.total_correct = 0;
        $scope.progress_width = 0;

        api.get(clientConfig.serviceUrls.buzz.courses.search.frontEnd, {
            params: {
                date: {
                    start: BuzzCalendar.getFirstDateOfWeek(today).toLocaleDateString(),
                    end: BuzzCalendar.getFirstDateOfNextWeek(today).toLocaleDateString()
                },
                enabled: true,
                level: query.level || 'B'
            }
        }).then(function (result) {
            var sorted = result.data.sort(function (lesson1, lesson2) {
                if (lesson1.date > lesson2.date) return -1;
                if (lesson1.date < lesson2.date) return 1;
                return 0;
            });
            //clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd
            //result.data    sort by id
            if (sorted.length > 0) {
                $scope.weeklyLessonId = sorted[0].lesson_id;

                quizFactory.getWeeklyQuizScore($scope.weeklyLessonId).then(function (json) {
                    if (!(json && json.detail)) {
                        $scope.weeklyStatus = 'exercise';
                    }
                });
            } else {
                $rootScope.$emit('weekly-quiz:hide');
            }
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
            console.log('weekly quiz = ', $scope.weeklyQuiz);
            $scope.arrayWeeklyQuiz = arrayWeeklyQuizParser.parse($scope.weeklyQuiz);
            console.log('array = ', $scope.arrayWeeklyQuiz);
            $scope.currentIndex = 0;
            $scope.currentQuiz = $scope.arrayWeeklyQuiz[$scope.currentIndex];
            $scope.progress_width = parseInt(($scope.currentIndex + 1) * 100 / $scope.arrayWeeklyQuiz.length);
            changeProgressWidth();
        });

        $scope.nextQuiz = function () {
            $scope.currentQuiz = $scope.arrayWeeklyQuiz[++$scope.currentIndex];
            $scope.progress_width = parseInt(($scope.currentIndex + 1) * 100 / $scope.arrayWeeklyQuiz.length);
            changeProgressWidth();
        };

        $rootScope.$on('answer:weekly-quiz', function (event, d) {
            quizFactory.saveResult({
                lesson_id: $scope.weeklyLessonId,
                type: 'weekly-quiz',
                result_id: String($scope.currentIndex),
                total: $scope.arrayWeeklyQuiz.length,
                wrong: d.status === 'Failed' ? 1 : 0,
                correct: d.status === 'Passed' ? 1 : 0,
                detail: {
                    title: String(d.title),
                    score: String(d.mark),
                    status: String(d.status)
                }
            });
        });

        function calculateScore() {
            quizFactory
                .getWeeklyQuizScore($scope.weeklyLessonId)
                .then(function (result) {
                    result.data = result;
                    $scope.score = [];
                    $scope.grade = 0;
                    if (result.data.group) {
                        //进行分数计算
                        var score0 = {
                            correct: 0
                        };
                        result.data.detail.map(function (detail) {
                            if (detail.key == 'status' && detail.value == 'Passed') {
                                score0.correct++;
                            }
                        });
                        score0.total_sum = result.data.group.total;
                        score0.total_correct = result.data.group.correct;
                        score0.type = '';
                        score0.score = parseInt((score0.correct / result.data.group.total) * 100);
                        $scope.score.push(score0);
                        console.log("score");
                        console.log(score0);
                        //总分累计
                        $scope.score.map(function (score) {
                            $scope.grade += score.score;
                        });
                    }
                });
        }

        function changeProgressWidth(){
            document.getElementById('progress-bar').style.width=$scope.progress_width+'%';
        }

    }])
;