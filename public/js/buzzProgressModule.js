angular.module('buzzProgressModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule', 'chart.js', 'quizModule', 'DateModule', 'serviceCacheModule', 'trackingModule', 'wechatShareModule'])
    .run(['$rootScope', 'trackingX', function ($rootScope, tracking) {
        tracking.sendX('Progress');
    }])
    .controller('calendarCtrl', ['$scope', '$http', 'clientConfig', 'quizFactory', '$filter', 'DateFactory', '$q', 'api', 'trackingX', 'levelFactory', function ($scope, $http, clientConfig, quizFactory, $filter, DateFactory, $q, api, tracking, levelFactory) {
        $scope.expanded = false;
        $scope.expandContent = function (value) {
            $scope.expanded = value;
            if (value) {
                tracking.sendX('progress.calenderOn.click');
            } else {
                tracking.sendX('progress.calender0ff.click');
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
            weekDays.forEach(function (week, weekindex) {
                var currentweek = ret[weekindex] = [];
                var firstday = null;

                if (weekindex === 0) {
                    var firstDataIndex = week.findIndex(function (val) {
                        return !!val;
                    });
                    firstday = moment(week[firstDataIndex]).add(-firstDataIndex - 1, 'day');
                } else if (weekindex === weekDays.length - 1) {
                    firstday = moment().add(1, 'months').date(0);
                }

                week.forEach(function (day, dayindex) {
                    var currentday = day || firstday.add(1, 'day').toDate();
                    var today = new Date();
                    currentweek.push({
                        date: currentday,
                        iscurrentmonth: currentday.getMonth() === today.getMonth(),
                        istoday: currentday.getMonth() === today.getMonth() && currentday.getDate() === today.getDate()
                    });
                });
            });

            return ret;
        };

        dateChanged();
        function getEmptyCalendar() {
            return [
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null]
            ];
        }

        function trimCalendar(weeks) {
            if (weeks < $scope.weekDays.length - 1) {
                $scope.weekDays.splice($scope.weekDays.length - 1, 1);
            }
        }

        function dateChanged() {
            var days = new Date($scope.current.getFullYear(), $scope.current.getMonth() + 1, 0).getDate();
            var theFirstDayOfCurrentMonth = new Date($scope.current.getFullYear(), $scope.current.getMonth(), 1).getDay();
            $scope.weekDays = getEmptyCalendar();
            var day = 1;
            for (var i = 0; i < $scope.weekDays.length; i++) {
                var start = 0;

                if (i === 0) {
                    start = {1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6}[theFirstDayOfCurrentMonth];
                }

                for (var j = start; j < $scope.weekDays[i].length && day <= days; j++) {
                    $scope.weekDays[i][j] = new Date($scope.current.getFullYear(), $scope.current.getMonth(), day++, 0, 0, 0);
                }

                if (day > days) {
                    break;
                }
            }

            trimCalendar(i);

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

            $q.all([
                quizFactory.getResult({
                    type: 'daily-exercise',
                    start_date: DateFactory.toDateISOString(DateFactory.getFirstDayOfMonth($scope.current)),
                    end_date: DateFactory.toDateISOString(DateFactory.getFirstDayOfNextMonth($scope.current))
                }),
                quizFactory.getResult({
                    type: 'weekly-quiz',
                    start_date: DateFactory.toDateISOString(DateFactory.getFirstDayOfMonth($scope.current)),
                    end_date: DateFactory.toDateISOString(DateFactory.getFirstDayOfNextMonth($scope.current))
                })
            ]).then(function (results) {
                return results.map(function (r) {
                    return r.data;
                }).reduce(function (current, next) {
                    return current.concat(next);
                }, []);
            }).then(function (results) {
                var dailyExercisePerf = [];

                results.map(function (p) {
                    var exerciseDate = new Date(p.start_date);

                    var d = $filter('date')(exerciseDate, 'yyyy-MM-dd');
                    $scope.perf[d].detail = p;
                    $scope.perf[d].goodness = getGoodness(p);

                    $scope.performances[$scope.perf[d].week][$scope.perf[d].day] = $scope.perf[d].goodness;

                    dailyExercisePerf.push(quizFactory.getQuizPerformance(p.quiz_result_group_id));
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

            function getThisWeekPerformance() {
                $scope.$parent.weekPerformance = {
                    good: 0,
                    bad: 0
                };
                levelFactory.getLevel().then(function (level) {
                    api.get(clientConfig.serviceUrls.buzz.progress.statistics.frontEnd + '?level=' + level + '&top=1')
                        .then(function (response) {
                            if (response.data.value.length) {
                                $scope.$parent.weekPerformance.good = response.data.value[0].num_of_all_correct_question_day;
                                $scope.$parent.weekPerformance.bad = response.data.value[0].num_of_incorrect_question_day;
                                $scope.$parent.rank = response.data.value[0].rank;
                                $scope.$parent.this_date = dateToYesterday(response.data.value[0].week_start_at.substring(0, 10)) + ' / ' + response.data.value[0].week_end_at.substring(0, 10);
                                console.log("date is :" + $scope.this_date);
                            }
                        });
                });

                function dateToYesterday(Day){
                    var date = new Date(Day);
                    date.setTime(date.getTime()+24*60*60*1000);
                    var yesterday = date.getFullYear()+"-" + (date.getMonth()+1) + "-" + date.getDate();
                    return yesterday;
                }

            }

            getThisWeekPerformance();
        }

        $scope.getYYYYMMDDByWeekDay = function (week, day) {
            return $filter('date')($scope.weekDays[week][day], 'yyyy-MM-dd');
        };
    }])
    .controller('calendarParentCtrl', ['$scope', function ($scope) {

    }])
    .controller('chartCtrl', ['$scope', '$timeout', 'api', '$http', 'clientConfig', 'levelFactory', function ($scope, $timeout, api, $http, clientConfig, levelFactory) {
        $scope.expanded = false;
        $scope.totalWord = 0;
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

        levelFactory.getLevel().then(function (level) {
            $http.get(clientConfig.serviceUrls.buzz.progress.statistics.frontEnd + '?level=' + level + '&top=5')
                .then(function (response) {
                    if (response.data.value.length) {
                        $scope.totalWord = 0;
                        var score_total_num = [];
                        var score_rank = [];
                        for (var x in response.data.value) {
                            score_total_num.unshift(response.data.value[x].num_of_correct_word);
                            $scope.totalWord += response.data.value[x].num_of_correct_word;
                        }
                        for (var x in response.data.value) {
                            score_rank.unshift(response.data.value[x].rank);
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
    .controller('pcChartCtrl', ['$scope', 'api', '$http', 'clientConfig', 'levelFactory', function ($scope, api, $http, clientConfig, levelFactory) {
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
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        //hank
        $scope.totalWord = 0;
        levelFactory.getLevel().then(function (level) {
            api.get(clientConfig.serviceUrls.buzz.progress.statistics.frontEnd + '?level=' + level + '&top=5')
                .then(function (response) {
                    if (response.data.value.length) {
                        var week_now = parseInt(response.data.value[0].week);
                        updateLabels(week_now, response.data.value);
                        for (var x in response.data.value) {
                            $scope.totalWord += response.data.value[x].num_of_correct_word;
                        }
                    }
                });
        });
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{
            yAxisID: 'y-axis-1',
            label: '你累计学习单词量：个/周',
            borderWidth: .5,
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
                        position: 'left',
                        gridLines: {
                            display: false
                        }
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: {
                            stepSize: 1,
                            reverse: true,
                            suggestedMin: 1,
                            suggestedMax: 10
                        },
                        gridLines: {
                            display: false
                        }
                    }
                ],
                xAxes: [
                    {
                        gridLines: {
                            display: false
                        }
                     }
                ]},
            responsive: true
        };
        function updateLabels(_week, data) {
            var score_total_num = [];
            var score_rank = [];
            $scope.labels = [];

            if (_week >= 5) {
                for (var i = 0; i <= 4; i++) {
                    $scope.labels.unshift(getWeekNumber(_week - i));
                    score_total_num.unshift(getTotal(_week - i));
                    score_rank.unshift(getRank(_week - i));
                }
            } else {
                for (var i = _week; i > 0; i--) {
                    $scope.labels.unshift(getWeekNumber(i));
                    score_total_num.unshift(getTotal(_week - i));
                    score_rank.unshift(getRank(_week - i));
                }
            }
            function getWeekNumber(n) {
                return '第' + n + '周';
            }

            function getTotal(n) {
                var result = 0;
                for (var x in data) {
                    if (parseInt(data[x].week) === n) {
                        result = data[x].num_of_correct_word;
                    }
                }
                return result;
            }

            function getRank(n) {
                var result = null;
                for (var x in data) {
                    if (parseInt(data[x].week) === n) {
                        result = data[x].rank;
                    }
                }
                return result;
            }

            $scope.data[0] = score_total_num;
            $scope.data[1] = score_rank;

        }
    }])
    .controller('myBuzzCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $rootScope.$watch('profile', function (newValue, oldValue) {
            if (newValue) {
                var registerDate = new Date(newValue.regist_date);
                var now = new Date();
                var days = (now - registerDate) / (1000 * 60 * 60 * 24);
                $scope.buzzDays = Math.floor(days + 1);
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
