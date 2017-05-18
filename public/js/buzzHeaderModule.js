angular.module('buzzHeaderModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule', 'serviceCacheModule'])
    .run(['$rootScope', 'service', 'clientConfig', 'api', function ($rootScope, service, clientConfig, api) {
        api.get(clientConfig.serviceUrls.sso.profile.load.frontEnd).then(function (result) {
            if (result.data.isSuccess) {
                $rootScope.profile = result.data.result;

                if (!$rootScope.profile.avatar) {
                    $rootScope.profile.avatar = '/public/images/default_avatar.png';
                }

                if ($rootScope.profile.avatar && $rootScope.profile.avatar.indexOf('//upload.bridgeplus.cn') === 0 && !$rootScope.profile.avatar.match(/-minor$/)) {
                    $rootScope.profile.avatar += '-minor';
                }

                $rootScope.profile.displayName = $rootScope.profile.display_name || $rootScope.profile.name || $rootScope.profile.nick_name || $rootScope.profile.real_name;
            } else {
                throw result.data;
            }
        });
    }])
    .factory('trackingX', ['tracking', '$rootScope', function (tracking, $rootScope) {
        return {
            sendX: function (eventName, data) {
                $rootScope.$watch('profile', function (newValue, oldValue) {
                    if (newValue) {
                        if (!data) {
                            data = {};
                        }

                        data.mobile = newValue.mobile;
                    }

                    tracking.sendX(eventName, data);
                });
            }
        };
    }])
    .controller('headerCtrl', ['$scope', '$rootScope', 'api', 'clientConfig', function ($scope, $rootScope, api, clientConfig) {
        $scope.isActive = function (link) {
            return location.pathname === link;
        }
        api.get(clientConfig.serviceUrls.buzz.profile.memberTag.frontEnd).then(function (result) {
            if (result.data.length > 0) {
                $scope.payingMember = true;
            }
        })
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

                $scope.showTheModal = function () {
                    $scope.showModal = true;
                    $scope.hideModal = false;
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
    .factory('levelFactory', ['api', '$q', 'queryParser', 'clientConfig', function (api, $q, queryParser, clientConfig) {
        return {
            getLevel: function () {
                var query = queryParser.parse();
                if (query.level) {
                    return $q.resolve(query.level);
                }

                return api.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd)
                    .then(function (result) {
                        if (result) {
                            return result.data;
                        }
                    })
                    .catch(function (reason) {
                        return 'B';
                    });
            }
        };
    }])
    ;