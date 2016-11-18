angular.module('signInModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule', 'errorParserModule'])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common['X-Request-With'] = 'XMLHttpRequest';
    }])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.translations('en', {}).translations('zh', {
            'Invalid user name or password': '错误的用户名或者密码',
            'Invalid identity or password': '错误的用户名或者密码',
            '/': '登录成功, 正在跳转中……'
        });
        $translateProvider.preferredLanguage('zh');
    }])
    .controller('signInCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', function ($scope, clientConfig, service, queryParser, serviceErrorParser) {
        $scope.signInData = {
            account: '',
            password: ''
        };

        $scope.signIn = function () {
            service.post(clientConfig.serviceUrls.sso.signIn.frontEnd, {
                value: $scope.signInData.account,
                password: $scope.signInData.password,
                return_url: queryParser.get('return_url')
            }).then(function (result) {
                console.log(result);
            }).catch(function (reason) {
                $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
            });
        };
    }])
;