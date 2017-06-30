angular.module('buzzSurveyModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule', 'serviceCacheModule'])
    .controller("surveyCtrl", ['$scope', '$rootScope', '$q', 'api', 'clientConfig', function ($scope, $rootScope, $q, api, clientConfig) {
        api.get(clientConfig.serviceUrls.buzz.survey.get.frontEnd).then(function (result) {
            $scope.surveyUrls = result.data.survey_url;
            if ($scope.surveyUrls == null) {
                $scope.survey = false;
            } else {
                $scope.survey = true;
            }
        })
    }])