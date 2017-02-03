angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', function ($scope, $http, queryParser, service, clientConfig) {
        var query = queryParser.parse();
        var level = query.level || 'B';

        $scope.level = level;
        if (query.category) {
            $scope.category = query.category;
        } else {
            $scope.category = '';
        }

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
                        c.baseNumber = result.data.baseNumber || 100;

                        return $http.get(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', c.category).replace(':level', c.level).replace(':lesson_id', c.lesson_id));
                    }).then(function (result) {
                        c.baseNumber = parseInt(c.baseNumber) + (parseInt(result.data.hits) || 0);
                    });
                });
            });

        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };
    }])
    .controller('courseCategoryCtrl', ['$scope', '$http', 'clientConfig', function ($scope, $http, clientConfig) {
        $http.get(clientConfig.serviceUrls.buzz.categories.list.frontEnd).then(function (result) {
            $scope.categories = result.data;
        });
    }])
;