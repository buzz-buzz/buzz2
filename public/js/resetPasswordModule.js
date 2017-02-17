angular.module('resetPasswordModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule', 'errorParserModule', 'formModule'])
// .config(['$httpProvider', function ($httpProvider) {
//     $httpProvider.defaults.headers.common['X-Request-With'] = 'XMLHttpRequest';
// }])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.translations('en', {}).translations('zh', {
            'missing validation code': '图形验证码不正确',
            'validate not pass': '图形验证码未通过，请重新输入',
            "Password can't be empty": '密码不能为空',
            'Identity already existed': '该手机号已注册',
            'sms validate error': '短信验证码不正确',
            '/sign-up?step=2': '注册成功，正在跳转至信息填写页面'
        });
        $translateProvider.preferredLanguage('zh');
    }])
    .controller('resetPasswordCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', function ($scope, clientConfig, service, queryParser, serviceErrorParser) {
        $scope.signUpData = {
            mobile: '',
            verificationCode: '',
            password: '',
            captchaId: '',
            captcha: '',
            agreed: false
        };

        $scope.resetPassword = function () {
            service.post(clientConfig.serviceUrls.sso.resetPassword.frontEnd, $scope.signUpData)
                .then(function () {
                    $scope.errorMessage = '';
                    $scope.successMessage = '密码重置成功！';
                })
                .catch(function (reason) {
                    $scope.successMessage = '';
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                });
        };
    }])
;