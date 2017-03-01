angular.module('buzzProgressModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule', 'chart.js', 'quizModule', 'DateModule'])
    .controller('calendarCtrl', ['$scope', '$http', 'clientConfig', 'quizFactory', '$filter', 'DateFactory', '$q', function ($scope, $http, clientConfig, quizFactory, $filter, DateFactory, $q) {
        $scope.expanded = false;
        $scope.expandContent = function (value) {
            $scope.expanded = value;
        };
        $scope.today = new Date();
        $scope.current = DateFactory.getCurrent();
        $scope.performances = [
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null]
        ];

        dateChanged();

        $scope.gotoMonth = function (diff) {
            $scope.current.setMonth($scope.current.getMonth() + diff);
            dateChanged();
        };

        function dateChanged() {
            var days = new Date($scope.current.getFullYear(), $scope.current.getMonth() + 1, 0).getDate();
            var theFirstDayOfCurrentMonth = new Date($scope.current.getFullYear(), $scope.current.getMonth(), 1).getDay();
            $scope.weekDays = [
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null]
            ];
            var day = 1;
            for (var i = 0; i < $scope.weekDays.length; i++) {
                var start = 0;

                if (i === 0) {
                    start = theFirstDayOfCurrentMonth;
                }

                for (var j = start; j < $scope.weekDays[i].length && day <= days; j++) {

                    $scope.weekDays[i][j] = new Date($scope.current.getFullYear(), $scope.current.getMonth(), day++, 0, 0, 0);
                }
            }

            getPerformances();
        }

        function getPerformance(date, week, day) {
            if (!date || date >= $scope.today) {
                return '';
            }

            var yyyyMMdd = $filter('date')(date, 'yyyy-MM-dd');

            if (!$scope.perf[yyyyMMdd]) {
                $scope.perf[yyyyMMdd] = {};
                $scope.perf[yyyyMMdd].week = week;
                $scope.perf[yyyyMMdd].day = day;
                $scope.perf[yyyyMMdd].goodness = 'none';
            }

            return $scope.perf[yyyyMMdd].goodness;
        }

        function getGoodness(detail) {
            if (detail.correct + detail.wrong <= 0) {
                return 'none';
            }

            if (detail.correct >= detail.total) {
                return 'good';
            }

            if (detail.wrong >= 0 || detail.correct < detail.total) {
                return 'bad';
            }
        }


        function getPerformances() {
            $scope.perf = {};
            for (var i = 0; i < $scope.weekDays.length; i++) {
                for (var j = 0; j < $scope.weekDays[i].length; j++) {
                    $scope.performances[i][j] = getPerformance($scope.weekDays[i][j], i, j);
                }
            }

            quizFactory.getResult({
                type: 'daily-exercise',
                start_date: DateFactory.toDateISOString(DateFactory.getFirstDayOfMonth($scope.current)),
                end_date: DateFactory.toDateISOString(DateFactory.getFirstDayOfNextMonth($scope.current))
            }).then(function (result) {
                var dailyExercisePerf = [];

                result.data.map(function (p) {
                    var exerciseDate = new Date(p.start_date);
                    var d = $filter('date')(exerciseDate, 'yyyy-MM-dd');
                    $scope.perf[d].detail = p;
                    $scope.perf[d].goodness = getGoodness(p);
                    $scope.performances[$scope.perf[d].week][$scope.perf[d].day] = $scope.perf[d].goodness;

                    dailyExercisePerf.push(quizFactory.getDailyExercisePerformance(p.quiz_result_group_id));
                });

                return dailyExercisePerf;
            }).then(function (requests) {
                return $q.all(requests);
            }).then(function (results) {
                $scope.$parent.totalScore = results
                    .map(function (r) {
                        return r.data;
                    })
                    .reduce(function (prev, next) {
                        return prev.concat(next);
                    }, [])
                    .filter(function (p) {
                        return p.key === 'score';
                    })
                    .map(function (perf) {
                        return Number(perf.value);
                    })
                    .reduce(function (prev, next) {
                        return prev + next;
                    }, 0)
                ;
            });

        }

        $scope.getYYYYMMDDByWeekDay = function (week, day) {
            return $filter('date')($scope.weekDays[week][day], 'yyyy-MM-dd');
        };
    }])
    .controller('calendarParentCtrl', ['$scope', function ($scope) {

    }])
    .controller('chartCtrl', ['$scope', function ($scope) {
        $scope.labels = ['第一周', '第二周', '第三周', '第四周', '第五周'];
        $scope.series = ['你累计学习单词量：个/周', '系统整体排名：名/周'];
        $scope.data = [
            [65, 59, 84, 81, 56],
            [28, 48, 40, 19, 86]
        ];
        $scope.datasetOverride = [
            {
                label: '你累计学习单词量：个/周',
                borderWidth: 0,
                type: 'bar'
            },
            {
                label: '系统整体排名：名/周',
                borderWidth: 1,
                type: 'line'
            }
        ];
        $scope.options = {
            scales: {
                yAxes: [
                    {id: '你累计学习单词量：个/周', type: 'linear', display: true, position: 'left'},
                    {id: '系统整体排名：名/周', type: 'bar', display: true, position: 'right'}
                ]
            }
        };
    }])
    .controller('topCtrl', ['$scope', function ($scope) {

    }])
;
