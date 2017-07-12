angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/video', {
                templateUrl: 'video.html',
                controller: 'videoCtrl',
                controllerAs: 'videoCtrl'
            })
            ;

        $routeProvider.otherwise('/video');
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {

    }])
    ;
