angular.module('buzzHistoryModule', ['angularQueryParserModule'])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', '$timeout', function ($scope, $http, queryParser, $timeout) {
        $http.get('/api/history-courses').then(function (result) {
            var level = queryParser.get('level') || 'B';
            $scope.courseList = result.data.byLevel[level].sort(function(a, b) {
                return (new Date(b)).valueOf() >= (new Date(a)).valueOf();
            });
            console.log($scope.courseList);
            for (var i = 0; i < $scope.courseList.length; i++) {
                var smilJson = '/resource/smil/' + $scope.courseList[i] + '-' + level + '.json';

                $scope.courseInfo = {};

                (function (i) {
                    $http.get(smilJson).then(function (result) {
                        var smil = result.data;
                        var date = $scope.courseList[i];
                        $scope.courseInfo[date] = {
                            title: smil.title,
                            date: date,
                            description: smil.description,
                            numberliked: smil.baseNumber
                        };
                    });
                })(i);
            }
            $scope.aLikeClick = function(href) {
                window.location.href = href;
            };
        });
    }])
;