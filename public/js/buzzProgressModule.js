angular.module('buzzProgressModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule', 'chart.js', 'quizModule', 'DateModule', 'serviceCacheModule', 'trackingModule'])
    .run(['$rootScope', 'tracking', function ($rootScope, tracking) {
        tracking.sendX('Progress');
    }])
    .controller('calendarCtrl', ['$scope', '$http', 'clientConfig', 'quizFactory', '$filter', 'DateFactory', '$q', 'api', function ($scope, $http, clientConfig, quizFactory, $filter, DateFactory, $q, api) {
        $scope.expanded = false;
        $scope.expandContent = function (value) {
            $scope.expanded = value;
            if (value) {
                tracking.sendX('progress.calanderOn.click');
            } else {
                tracking.sendX('Pprogress.calander0ff.click');
            }
        };
        $scope.today = new Date();
        $scope.current = DateFactory.getCurrentDate();
        $scope.performances = [
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null]
        ];

        $scope.gotoMonth = function (diff) {
            $scope.current = new Date($scope.current.getFullYear(), $scope.current.getMonth() + diff, 1);
            dateChanged();
        };
        var extendWeekDays = function (weekDays) {
            var ret = [];
            weekDays.forEach(function (weeks, weekindex) {
                var currentweek = ret[weekindex] = [];
                var firstday = null;
                var dayIndex = 0;

                if (weekindex === 0) {
                    var firstDataIndex = weeks.findIndex(function (val) {
                        return !!val;
                    });
                    firstday = moment(weeks[firstDataIndex]).add((firstDataIndex * -1) - 1, 'day');
                } else if (weekindex === weekDays.length - 1) {
                    var lastweek = weeks[weekindex];
                    firstday = moment().add(1, 'months').date(0);
                }
                ;
                weeks.forEach(function (day, dayindex) {
                    var currentday = day || firstday.add(1, 'day').toDate();
                    var today = new Date();
                    currentweek.push({
                        date: currentday,
                        iscurrentmonth: currentday.getMonth() === today.getMonth(),
                        istoday: currentday.getMonth() === today.getMonth() && currentday.getDate() === today.getDate()
                    });
                });
            })
            return ret;
        };

        dateChanged();
        function dateChanged() {
            var days = new Date($scope.current.getFullYear(), $scope.current.getMonth() + 1, 0).getDate();
            var theFirstDayOfCurrentMonth = new Date($scope.current.getFullYear(), $scope.current.getMonth(), 1).getDay();
            $scope.weekDays = [
                [null, null, null, null, null, null, null],
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

                if (day > days) {
                    break;
                }
            }

            if (i < $scope.weekDays.length - 1) {
                $scope.weekDays.splice($scope.weekDays.length - 1, 1);
            }

            getPerformances();
            $scope.extendedweekdays = extendWeekDays($scope.weekDays);
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
            $scope.rank = 2048;
            $scope.totalScore = 0;
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
                var firstDayOfWeek = DateFactory.getFirstDayOfWeek($scope.current);
                var firstDayOfNextWeek = DateFactory.getFirstDayOfNextWeek($scope.current);
                $scope.$parent.weekPerformance = {
                    good: 1,
                    bad: 1
                };
                //hank
                api.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd)
                    .then(function (result) {
                        $http.get(clientConfig.serviceUrls.buzz.progress.Statistics.frontEnd + '?level=' + result.data + '&top=1')
                            .then(function (response) {
                                if (response.data.value.length) {
                                    $scope.$parent.weekPerformance.good = response.data.value[0].num_of_all_correct_question_day;
                                    $scope.$parent.weekPerformance.bad = response.data.value[0].num_of_incorrect_question_day;
                                    $scope.$parent.rank = response.data.value[0].rank;
                                }
                            });
                    });

                var dailyExercisePerf = [];

                result.data.map(function (p) {
                    var exerciseDate = new Date(p.start_date);

                    var d = $filter('date')(exerciseDate, 'yyyy-MM-dd');
                    $scope.perf[d].detail = p;
                    $scope.perf[d].goodness = getGoodness(p);

                    if (exerciseDate >= firstDayOfWeek && exerciseDate < firstDayOfNextWeek) {
                        if ($scope.perf[d].goodness === 'bad') {
                            //$scope.$parent.weekPerformance.bad++;
                        }

                        if ($scope.perf[d].goodness === 'good') {
                            //$scope.$parent.weekPerformance.good++;
                        }
                    }

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
    .controller('chartCtrl', ['$scope', '$timeout', 'api', '$http', 'clientConfig', function ($scope, $timeout, api, $http, clientConfig) {
        $scope.expanded = false;
        $scope.totalWord = 1200;
        $scope.expandContent = function (value) {
            $scope.expanded = value;
            $timeout(function () {
                document.body.scrollTop = document.body.scrollHeight;
            });
            if (value) {
                tracking.sendX('progress.chartOn.click');
            } else {
                tracking.sendX('progress.chartOff.click');
            }
        };
        $scope.labels = ['第一周', '第二周', '第三周', '第四周', '第五周'];
        $scope.series = ['你累计学习单词量：个/周', '系统整体排名：名/周'];
        $scope.data = [
            [65, 59, 84, 81, 56],
            [28, 48, 40, 19, 86]
        ];
        function createM_Linedata(originDataArray) {
            var retArrary = [];
            originDataArray.reduce(function (previous, next, originPrevious) {
                var result = {};
                var adjustNext = next;
                var absHeight = Math.abs(previous - next);
                if (absHeight > 5) {
                    if (next > previous) {
                        result.shapeClass = "up";
                        result.point = next;
                    } else {
                        result.shapeClass = "down";
                        result.point = previous;
                    }
                    result.height = absHeight;
                    adjustNext = next;
                } else {
                    adjustNext = previous;
                    result.shapeClass = "eval";
                    result.point = previous;
                    result.height = 0;
                }
                retArrary.push(result);
                return adjustNext;
            });
            return retArrary;
        }

        //hank
        api.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd)
            .then(function (result) {
                $http.get(clientConfig.serviceUrls.buzz.progress.Statistics.frontEnd + '?level=' + result.data + '&top=5')
                    .then(function (response) {
                        if (response.data.value.length) {
                            $scope.totalWord = 0;
                            var score_total_num = [];
                            var score_rank = [];
                            for (var x in response.data.value) {
                                score_total_num.push(response.data.value[x].num_of_correct_word);
                                $scope.totalWord += response.data.value[x].num_of_correct_word;
                            }
                            for (var x in response.data.value) {
                                score_rank.push(response.data.value[x].rank);
                            }
                            $scope.data[0] = score_total_num;
                            $scope.data[1] = score_rank;
                            $scope.m_linedata = createM_Linedata($scope.data[1]);
                        }
                    });
            });

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
    .controller('pcChartCtrl', ['$scope', 'api', '$http', 'clientConfig', function ($scope, api, $http, clientConfig) {
        $scope.labels = ['第一周', '第二周', '第三周', '第四周', '第五周'];
        $scope.colors = [{
            backgroundColor: "rgba(249,182,0,.6)",
            pointBackgroundColor: "#f9b600",
            pointHoverBackgroundColor: "#f9b600",
            borderColor: "#f9b600",
            pointBorderColor: '#fff',
            pointHoverBorderColor: "#f9b600"
        }, {
            backgroundColor: "transparent",
            pointBackgroundColor: "#3366ff",
            pointHoverBackgroundColor: "#3366ff",
            borderColor: "#3366ff",
            pointBorderColor: '#fff',
            pointHoverBorderColor: "#3366ff"
        }];
        $scope.series = ['Series A', 'Series B'];
        $scope.data = [
            [65, 59, 84, 81, 56],
            [28, 48, 40, 19, 86]
        ];
        //hank
        $scope.totalWord = 1200;
        api.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd)
            .then(function (result) {
                $http.get(clientConfig.serviceUrls.buzz.progress.Statistics.frontEnd + '?level=' + result.data + '&top=5')
                    .then(function (response) {
                        if (response.data.value.length) {
                            $scope.totalWord = 0;
                            var score_total_num = [];
                            var score_rank = [];
                            for (var x in response.data.value) {
                                score_total_num.push(response.data.value[x].num_of_correct_word);
                                $scope.totalWord += response.data.value[x].num_of_correct_word;
                            }
                            for (var x in response.data.value) {
                                score_rank.push(response.data.value[x].rank);
                            }
                            $scope.data[0] = score_total_num;
                            $scope.data[1] = score_rank;
                        }
                    });
            });
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{
            yAxisID: 'y-axis-1',
            label: '你累计学习单词量：个/周',
            borderWidth: 1,
            type: 'bar'
        }, {
            yAxisID: 'y-axis-2',
            label: '系统整体排名：名/周',
            borderWidth: 1,
            type: 'line'
        }];
        $scope.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            },
            responsive: true
        };
    }])
    .controller('myBuzzCtrl', ['$scope', '$rootScope', '$http', 'clientConfig', function ($scope, $rootScope, $http, clientConfig) {
        $rootScope.$watch('profile', function (newValue, oldValue) {
            if (newValue) {
                var registerDate = new Date(newValue.regist_date);
                var now = new Date();
                var days = (now - registerDate) / (1000 * 60 * 60 * 24);

                $scope.buzzDays = (days + 1);
            }
        });
    }])
    .controller('myPerformanceCtrl', ['$scope', '$http', 'clientConfig', 'api', '$q', function ($scope, $http, clientConfig, api, $q) {
        api.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd).then(function (result) {
            $scope.currentLevel = result.data;
        });

        $q.all([api.get(clientConfig.serviceUrls.buzz.quiz.lessonCount.frontEnd, {
            params: {
                type: 'vocabulary'
            }
        })]).then(function (results) {
            $scope.lessonCount = results.map(function (r) {
                return r.data.count
            }).reduce(function (prev, next) {
                return Number(prev) + Number(next);
            }, 0)
        });
    }])
;
