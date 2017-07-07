angular.module('buzzSurveyModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule', 'serviceCacheModule'])
    .controller("surveyCtrl", ['$scope', '$rootScope', '$q', 'api', 'clientConfig', 'queryParser', function ($scope, $rootScope, $q, api, clientConfig, queryParser) {
        var query = queryParser.parse();
        var test = '';

        if (query.test) {
            test = '1';
        }

        api.get(clientConfig.serviceUrls.buzz.survey.get.frontEnd)
            .then(function (result) {
                $scope.surveyUrls = result.data.survey_url;
                if ($scope.surveyUrls == null) {
                    $scope.survey = false;
                    return false;
                } else {
                    return result.data.survey_url.replace('https://www.wenjuan.com/s/', '').replace('/', '');
                }
            })
            .then(function (short_id) {
                if (short_id) {
                    api.get(clientConfig.serviceUrls.wechat.surveyApi.get.frontEnd + '?short_id=' + short_id + '&test=' + test).then(function (result) {
                        if (result.data) {
                            console.log('----------url-------');
                            $scope.surveyUrls = '/survey?url= ' + encodeURIComponent(result.data) + '&short_id=' + short_id;
                            $scope.survey = true;
                        } else {
                            $scope.survey = false;
                        }
                    });
                }
            })
        ;


        $scope.close = function () {
            document.getElementById("survey").style.display = "none";
        }
    }]);