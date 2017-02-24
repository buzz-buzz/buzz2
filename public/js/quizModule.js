angular.module('quizModule', ['clientConfigModule'])
    .factory('quizFactory', ['$http', 'clientConfig', function ($http, clientConfig) {
        return {
            saveResultGroup: function (data) {
                return $http.put(clientConfig.serviceUrls.buzz.quiz.resultGroup.frontEnd, data);
            },

            saveResult: function(data){
                return $http.put(clientConfig.serviceUrls.buzz.quiz.result.frontEnd, data);
            }
        };
    }])
;