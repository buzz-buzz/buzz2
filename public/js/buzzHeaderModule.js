angular.module('buzzHeaderModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .run(['$rootScope', 'service', 'clientConfig', function ($rootScope, service, clientConfig) {
        service.get(clientConfig.serviceUrls.sso.profile.load.frontEnd).then(function (result) {
            $rootScope.profile = result;

            if ($rootScope.profile.avatar && $rootScope.profile.avatar.indexOf('//upload.bridgeplus.cn') === 0) {
                $rootScope.profile.avatar += '-minor';
            }
        });
    }])
    .controller('headerCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.isActive = function (link) {
            return location.pathname === link;
        };
    }])
;