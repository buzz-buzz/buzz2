angular.module('accountModule', ['clientConfigModule', 'buzzHeaderModule', 'educationModule'])
    .controller('viewAccountCtrl', ['$http', 'clientConfig', '$rootScope', '$scope', 'GenderDisplay', 'GradeDisplay', function ($http, clientConfig, $rootScope, $scope, GenderDisplay, GradeDisplay) {
        $rootScope.$watch('profile', function (newValue, oldValue) {
            if (newValue) {
                $scope.displayGender = GenderDisplay[newValue.gender];
            }
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.latestEducation.frontEnd)
            .then(function (result) {
                $scope.info = {
                    displayGrade: GradeDisplay[result.data]
                };
            });
    }])
;