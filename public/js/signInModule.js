angular.module('signInModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule', 'errorParserModule', 'trackingModule'])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common['X-Request-With'] = 'XMLHttpRequest';
    }])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.translations('en', {}).translations('zh', {
            'Invalid user name or password': '错误的用户名或者密码',
            'Invalid identity or password': '错误的用户名或者密码',
            '/': '登录成功, 正在跳转中……',
            '/my/today': '登录成功, 正在跳转至今日课程页面……',
            '/my/history': '登录成功，正在跳转至历史课程页面……'
        });
        $translateProvider.preferredLanguage('zh');
    }])
    .controller('signInCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', 'tracking', function ($scope, clientConfig, service, queryParser, serviceErrorParser) {
        $scope.signInData = {
            account: '',
            password: ''
        };

        $scope.signIn = function () {
            tracking.send('log-in.login.beforeClick');
            service.post(clientConfig.serviceUrls.sso.signIn.frontEnd, {
                value: $scope.signInData.account,
                password: $scope.signInData.password,
                return_url: queryParser.get('return_url')
            }).then(function (result) {
                console.log(result);
                tracking.send('log-in.login.afterClick');
            }).catch(function (reason) {
                $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                tracking.send('log-in.login.afterClick.error', reason);
            });
        };

        tracking.send('log-in');
    }])
;