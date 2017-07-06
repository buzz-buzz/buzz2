angular.module('buzzSurveyModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule', 'serviceCacheModule'])
    .controller("surveyCtrl", ['$scope', '$rootScope', '$q', 'api', 'clientConfig', function ($scope, $rootScope, $q, api, clientConfig) {
        // api.get(clientConfig.serviceUrls.buzz.survey.get.frontEnd).then(function (result) {
        //     $scope.surveyUrls = result.data.survey_url;
        //     if ($scope.surveyUrls == null) {
        //         $scope.survey = false;
        //     } else {
        //         //1.获取到url  截取short_id
        //         var short_id = $scope.surveyUrls.replace('https://www.wenjuan.com/s/', '').replace('/', '');
        //         console.log('---------short_id------');
        //         console.log(short_id);
        //         //2.从wechat-module 获取问卷网api:需要参数 short_id,member_id,buzzbuzz
        //
        //         api.get(clientConfig.serviceUrls.wechat.surveyApi.get.frontEnd + '?short_id=' + short_id).then(function (result) {
        //             console.log('---------wechat- url------');
        //             console.log(result);
        //
        //             //真正的url赋值
        //             //$scope.surveyUrls = '/survey?url= '+ encodeURIComponent(result.data.survey_url);
        //             $scope.survey = true;git
        //         });
        //     }
        // });
        // $scope.close = function () {
        //     document.getElementById("survey").style.display = "none";
        // }
    }]);