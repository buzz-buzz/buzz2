angular.module('quizModule', ['clientConfigModule'])
    .factory('quizFactory', ['$http', 'clientConfig', '$q', function ($http, clientConfig, $q) {
        var perfCache = {};

        return {
            saveResultGroup: function (data) {
                return $http.put(clientConfig.serviceUrls.buzz.quiz.resultGroup.frontEnd, data);
            },

            saveResult: function (data) {
                return $http.put(clientConfig.serviceUrls.buzz.quiz.result.frontEnd, data);
            },

            getResult: function (data) {
                return $http.get(clientConfig.serviceUrls.buzz.quiz.result.frontEnd, {
                    params: data
                });
            },

            getVocabularyPerformance: function (data) {
                if (perfCache[data.lesson_id]) {
                    return $q.resolve(perfCache[data.lesson_id]);
                }

                return $http.get(clientConfig.serviceUrls.buzz.quiz.vocabularyPerformance.frontEnd, {
                    params: data
                }).then(function (res) {
                    perfCache[data.lesson_id] = res.data;

                    return res.data;
                });
            },

            getDailyExercisePerformance: function (groupId) {
                return $http.get(clientConfig.serviceUrls.buzz.quiz.dailyExercisePerformance.frontEnd, {
                    params: {
                        quiz_result_group_id: groupId
                    }
                });
            }
        };
    }])
;