angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/survey', {
                templateUrl: 'survey.html',
                controller: 'surveyCtrl',
                controllerAs: 'surveyCtrl'
            })
            .when('/agreement', {
                templateUrl: 'agreement.html',
                controller: 'surveyCtrl',
                controllerAs: 'surveyCtrl'
            })
            ;

        $routeProvider.otherwise('/survey');
    }])
    .controller('surveyCtrl', ['$scope', function ($scope) {

    }])
    ;