angular.module('buzzSurveyModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule', 'serviceCacheModule'])
    .controller("surveyCtrl", ['$scope', '$rootScope', '$q', 'api', 'clientConfig', 'queryParser', function ($scope, $rootScope, $q, api, clientConfig, queryParser) {
        var query = queryParser.parse();

        api.get(clientConfig.serviceUrls.buzz.survey.latest.frontEnd)
            .then(function (result) {
                if (result.data) {
                    $scope.surveyUrl = '/survey?short_id=' + result.data;
                    result.data.survey_url; $scope.showSurvey = true;
                }
            })
            ;

        $scope.close = function () {
            document.getElementById("survey").style.display = "none";
        };
    }]);