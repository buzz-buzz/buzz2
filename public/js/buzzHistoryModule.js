angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', function ($scope, $http, queryParser, service, clientConfig) {
        var level = queryParser.get('level') || 'B';

        $scope.level = level;
        $scope.category = 'SCIENCE';

        $http.get(clientConfig.serviceUrls.buzz.courses.find.frontEnd.replace(':category', $scope.category).replace(':level', level).replace(':enabled', 'true'))
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

                        return $http.get(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', $scope.category).replace(':level', $scope.level).replace(':lesson_id', c.lesson_id));
                    }).then(function (result) {
                        c.baseNumber = parseInt(c.baseNumber || '0') + parseInt(result.data.hits);
                        console.log(c.baseNumber);
                    });
                });
            });

        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };
    }])
;