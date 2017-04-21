angular.module('quizModule', ['clientConfigModule', 'serviceCacheCoreModule'])
    .factory('quizFactory', ['$http', 'clientConfig', '$q', 'api', function ($http, clientConfig, $q, api) {
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
            },

            getWeeklyQuizScore: function (lesson_id) {
                return api.get(clientConfig.serviceUrls.buzz.weekly.getScore.frontEnd, {
                        params: {
                            lesson_id: lesson_id
                        }
                    }
                ).then(function (result) {
                    return result.data;
                });
            },

            clearWeeklyQuizScoreCache: function (lesson_id) {
                return api.clearCache('get', clientConfig.serviceUrls.buzz.weekly.getScore.frontEnd, {
                    params: {
                        lesson_id: lesson_id
                    }
                });
            }
        };
    }])
;