angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', function ($scope, $http, queryParser, service, clientConfig) {
        var level = queryParser.get('level') || 'B';

        $scope.level = level;

        $http.get(clientConfig.serviceUrls.buzz.courses.find.frontEnd.replace(':category', 'SCIENCE').replace(':level', level).replace(':enabled', 'true'))
            .then(function (result) {
                result = result.data;

                $scope.courseList = result.sort(function (a, b) {
                    if (a.date > b.date) {
                        return -1;
                    }

                    if (a.date < b.date) {
                        return 1;
                    }

                    return 0;
                });

                $scope.courseList.map(function (c) {
                    $http.get(c.video_path).then(function (result) {
                        c.title = result.data.title;
                        c.baseNumber = result.data.baseNumber;
                    });
                });
            });

        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };
    }])
;