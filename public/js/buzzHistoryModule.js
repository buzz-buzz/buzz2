angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', function ($scope, $http, queryParser, service, clientConfig) {
        var level = queryParser.get('level') || 'B';

        $scope.level = level;

        console.log(clientConfig);
        service.get(clientConfig.serviceUrls.buzz.courses.frontEnd, {
            params: {
                category: 'SCIENCE',
                level: level,
                enabled: true
            }
        })
            .then(function (result) {
                console.log(result);
            });

        $http.get('/api/history-courses').then(function (result) {
            $scope.courseList = result.data.byLevel[level].sort(function (a, b) {
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
            $scope.aLikeClick = function (href) {
                window.location.href = href;
            };
        });
    }])
;