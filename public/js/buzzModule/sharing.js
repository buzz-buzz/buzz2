angular.module('buzzModule')
    .controller('sharingCtrl', ['$scope', '$rootScope', '$q', function ($scope, $rootScope, $q) {
        function wechatSharable(event) {
            try {
                var data = JSON.parse(event.data.substr(11));
                $rootScope.wechatSharable.desc = '每天15分钟，学英语读世界！';

                $scope.showModal = true;
                $scope.videoData = data;

                try {
                    $scope.$apply();
                }catch(err){

                }
            } catch (ex) {
                console.error(ex);
            }
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

        $q.all([videoEnd(), getProfile()]).then(function (results) {
            wechatSharable(results[0]);
        });
    }])
    .component('sharing', {
        templateUrl: '/js/buzzModule/sharing.html',
        bindings: {}
    })
;