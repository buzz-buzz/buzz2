angular.module('buzzModule')

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
    .controller('weeklyQuizCtrl', ['$scope', 'BuzzCalendar', 'queryParser', 'api', 'clientConfig', 'weeklyQuizParser', 'arrayWeeklyQuizParser', '$q', 'quizFactory', '$rootScope', function ($scope, BuzzCalendar, queryParser, api, clientConfig, weeklyQuizParser, arrayWeeklyQuizParser, $q, quizFactory, $rootScope) {
        var query = queryParser.parse();
        var now = query.today ? new Date(query.today) : new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        $scope.weeklyStatus = 'menu';
        $scope.turnTo = function (sta) {
            $scope.weeklyStatus = sta;
        };

        $scope.weeklyLessonId = null;

        api.get(clientConfig.serviceUrls.buzz.courses.search.frontEnd, {
            params: {
                date: {
                    start: BuzzCalendar.getFirstDateOfWeek(today).toLocaleDateString(),
                    end: BuzzCalendar.getFirstDateOfNextWeek(today).toLocaleDateString()
                }
            }
        }).then(function (result) {
            $scope.weeklyLessonId = result.data.sort(function (lesson1, lesson2) {
                if (lesson1.date > lesson2.date) return -1;
                if (lesson1.date < lesson2.date) return 1;
                return 0;
            })[0].lesson_id;

            console.log($scope.weeklyLessonId);

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
            $scope.arrayWeeklyQuiz = arrayWeeklyQuizParser.parse($scope.weeklyQuiz);
            $scope.currentIndex = 0;
            $scope.currentQuiz = $scope.arrayWeeklyQuiz[$scope.currentIndex];
        });

        $scope.nextQuiz = function () {
            $scope.currentQuiz = $scope.arrayWeeklyQuiz[++$scope.currentIndex];
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
    }])
;