angular.module('buzzModule')
    .controller('sharingCtrl', ['$scope', '$rootScope', '$q', 'api', 'clientConfig', function ($scope, $rootScope, $q, api, clientConfig) {
        function wxReady() {
            var dfd = $q.defer();

            if (wx.isReady) {
                dfd.resolve();
            }

            wx.ready(function () {
                dfd.resolve();
            });

            return dfd.promise;
        }

        function wechatSharable(videoData, lessonCount, vocabularyCount) {
            try {
                $rootScope.wechatSharable.desc = '每天15分钟，学英语读世界！第 ' + $scope.buzzDays + ' 天，看 ' + lessonCount + ' 条新闻，学 ' + vocabularyCount + ' 个单词。';

                wxReady().then(function () {
                    wx.onMenuShareTimeline(angular.extend({}, $rootScope.wechatSharable, {
                        title: $rootScope.wechatSharable.desc
                    }));

                    wx.onMenuShareAppMessage(angular.extend({}, $rootScope.wechatSharable));
                });

                $scope.videoData = videoData;
            } catch (ex) {
                console.error(ex);
            }
        }

        function getVideoData() {
            var dfd = $q.defer();

            window.addEventListener('message', function (event) {
                if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('videoData:got//') === 0) {
                    dfd.resolve(JSON.parse(event.data.substr(15)));
                }
            }, false);

            return dfd.promise;
        }

        function videoEnd() {
            var dfd = $q.defer();

            window.addEventListener('message', function (event) {
                if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('video:end//') === 0) {
                    dfd.resolve(event);
                }
            }, false);

            return dfd.promise;
        }

        function getProfile() {
            var dfd = $q.defer();

            $rootScope.$watch('profile', function (newValue, oldValue) {
                if (newValue) {
                    dfd.resolve(newValue);
                }
            });

            return dfd.promise;
        }

        function getLessonCount() {
            return api.get(clientConfig.serviceUrls.buzz.memberCourse.count.frontEnd)
                .then(function (result) {
                    return result.data;
                })
                ;
        }

        function getVocabularyCount() {
            return api.get(clientConfig.serviceUrls.buzz.profile.memberVocabulary.correct.frontEnd)
                .then(function (result) {
                    return result.data;
                })
                ;
        }

        $q.all([getVideoData(), getProfile(), getLessonCount(), getVocabularyCount()]).then(function (results) {
            wechatSharable(results[0], results[2], results[3]);
        });

        $q.all([videoEnd()]).then(function (results) {
            $scope.showModal = true;
        });
    }])
    .component('sharing', {
        templateUrl: '/js/buzzModule/sharing.html',
        bindings: {}
    })
    ;