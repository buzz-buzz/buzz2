angular.module('buzzModule')
    .controller('sharingCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        window.addEventListener('message', function (event) {
            if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('video:end//') === 0) {
                try {
                    var data = JSON.parse(event.data.substr(11));
                    console.log('video end: ', data);
                    $rootScope.wechatSharable.desc = ($rootScope.profile.displayName || '我') + ' 在 Buzzbuzz 看青少年英语新闻';
                } catch (ex) {
                    console.error(ex);
                }
            }
        }, false);
    }])
    .component('sharing', {
        templateUrl: '/js/buzzModule/sharing.html',
        bindings: {

        }
    })
    ;