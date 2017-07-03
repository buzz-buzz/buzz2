angular.module('pcModule', [
    'ngRoute',
    'mobile-angular-ui',
    'buzzModule'
])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/survey', {
                templateUrl: 'user-account.html',
                controller: 'userAccountCtrl',
                controllerAS: 'userAccountCtrl'
            });

        $routeProvider.otherwise('/weekly-quiz');
    }])
;