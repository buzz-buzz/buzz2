angular.module('buzzSurveyModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule', 'serviceCacheModule'])
    .controller("surveyCtrl", ['$scope', '$rootScope', '$q', 'api', 'clientConfig', 'queryParser', function ($scope, $rootScope, $q, api, clientConfig, queryParser) {
        var query = queryParser.parse();

        api.get(clientConfig.serviceUrls.buzz.survey.latest.frontEnd)
            .then(function (result) {
                if (result.data) {
                    var timestamp = (new Date()).getTime();
                    $scope.surveyUrl = '/survey/' + timestamp + '?short_id=' + result.data;
                    $scope.showSurvey = true;
                }
            })
            ;

        $scope.close = function () {
            document.getElementById("survey").style.display = "none";
        };
    }])
    ;