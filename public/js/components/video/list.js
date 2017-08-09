angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/video-list', {
                templateUrl: 'video-list.html',
                controller: 'videoListCtrl',
                controllerAs: 'videoListCtrl'
            });
    }])
    .controller('videoListCtrl', ['$scope', '$http', function ($scope, $http) {
        $http.get('/api/videos').then(function (results) {
            $scope.videos = results.data;
        });
    }]);