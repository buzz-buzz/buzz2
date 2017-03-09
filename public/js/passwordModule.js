angular.module('passwordModule', ['clientConfigModule', 'buzzHeaderModule', 'servicesModule', 'errorParserModule'])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.translations('en', {}).translations('zh', {
            'Original password mismatch': '原密码输入错误',
        });
        $translateProvider.preferredLanguage('zh');
    }])
    .controller('changePasswordCtrl', ['$http', 'clientConfig', '$rootScope', '$scope', 'service', 'serviceErrorParser', function ($http, clientConfig, $rootScope, $scope, service, serviceErrorParser) {
        $scope.data = {};

        $scope.changePassword = function () {
            if ($scope.data.currentPassword === $scope.data.password) {
                $scope.errorMessage = '新密码不能与原密码相同！';
                $scope.successMessage = null;
                return false;
            }

            if (!($scope.data.password === $scope.data.password2)) {
                $scope.errorMessage = '两次输入的新密码不一致！';
                $scope.successMessage = null;
                return false;
            }

            service.post(clientConfig.serviceUrls.sso.profile.changePassword.frontEnd, {
                password: $scope.data.currentPassword,
                newPassword: $scope.data.password
            }).then(function () {
                $scope.successMessage = '密码修改成功！';
                $scope.errorMessage = null;
            }).catch(function (reason) {
                console.error(reason);
                $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                $scope.successMessage = null;
            });
        };
    }])
;