angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', 'httpPaginationData', '$httpParamSerializer', function ($scope, $http, queryParser, service, clientConfig, httpPaginationData, $httpParamSerializer) {
        var query = queryParser.parse();
        if (!query.level) {
            query.level = 'B';
        }
        if (!query.enabled) {
            query.enabled = true;
        }
        if (!query.date) {
            query.date = { end: new Date(2022, 1, 1).toISOString() };
        }
        if (query.category) {
            $scope.category = query.category;
        } else {
            $scope.category = '';
            url = clientConfig.serviceUrls.buzz.courses.findByLevel.frontEnd;
        }
        var url = clientConfig.serviceUrls.buzz.courses.search.frontEnd + '?' + $httpParamSerializer(query);

        function sortByDate(a, b) {
            if (a.date > b.date) {
                return -1;
            }

            if (a.date < b.date) {
                return 1;
            }

            return 0;
        }

        $scope.courseData = new httpPaginationData({
            sourceUrl: url,
            pageSize: 7,
            dataField: 'rows',
            dataGotCallback: function (result) {
                if (typeof result.length === 'undefined') {
                    result = result.data;
                }

                $scope.courseList = result.sort(sortByDate);

                $scope.courseList.map(function (c) {
                    $http.get(c.video_path).then(function (result) {
                        c.title = result.data.title;
                        c.baseNumber = result.data.baseNumber || 100;
                        c.image = result.data.image || 'http://source.bridgeplus.cn/image/png/buzz-poster.png';

                        return $http.get(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', c.category).replace(':level', c.level).replace(':lesson_id', c.lesson_id));
                    }).then(function (result) {
                        c.baseNumber = parseInt(c.baseNumber) + (parseInt(result.data.hits) || 0);
                    });
                });
            }
        });

        $scope.courseData.getNextPage();

        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };
    }])
    .controller('courseCategoryCtrl', ['$scope', '$http', 'clientConfig', 'queryParser', function ($scope, $http, clientConfig, queryParser) {
        $http.get(clientConfig.serviceUrls.buzz.categories.list.frontEnd).then(function (result) {
            $scope.categories = result.data;
        });

        $scope.currentCategory = queryParser.get('category');
    }])
    ;