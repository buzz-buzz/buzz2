angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', function ($scope, $http, queryParser, service, clientConfig) {
        var level = queryParser.get('level') || 'B';

        $scope.level = level;

        service.get(clientConfig.serviceUrls.buzz.courses.frontEnd.replace(':category', 'SCIENCE').replace(':level', level).replace(':enabled', 'true'))
            .then(function (result) {
                $scope.courseList = result.sort(function (a, b) {
                    if (a.date > b.date) {
                        return -1;
                    }

                    if (a.date < b.date) {
                        return 1;
                    }

                    return 0;
                });
            });

        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };
    }])
;