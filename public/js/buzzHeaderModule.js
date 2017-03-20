angular.module('buzzHeaderModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule'])
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
    .value('GenderDisplay', {
        U: '未知',
        M: '金童',
        F: '玉女'
    })
    .factory('modalFactory', ['$timeout', function ($timeout) {
        return {
            bootstrap: function ($scope, $rootScope, modalId) {
                $scope.showModal = false;
                $scope.hideModal = false;

                $scope.hideTheModal = function () {
                    $scope.hideModal = true;
                    $scope.showModal = false;
                };

                $scope.keepModal = function ($event) {
                    $event.stopPropagation();
                };

                var destroy = $rootScope.$on('modal:show' + modalId, function () {
                    $timeout(function () {
                        $scope.hideModal = false;
                        $scope.showModal = true;
                    });
                });

                var destroy2 = $rootScope.$on('modal:hide', $scope.hideTheModal);

                $scope.$on('$destroy', function () {
                    destroy();
                    destroy2();
                });
            }
        };
    }])
;