angular.module('signUpModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule', 'errorParserModule', 'ui.select', 'trackingModule', 'educationModule', 'formModule'])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common['X-Request-With'] = 'XMLHttpRequest';
    }])
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
    .controller('signUpParentCtrl', ['$scope', 'queryParser', 'tracking', function ($scope, queryParser, tracking) {
        $scope.step = queryParser.get('step') || 1;

        tracking.send('sign-up', {
            step: $scope.step
        });

        var query = queryParser.parse();

        $scope.bindMobileMode = !!query.token;
    }])
    .controller('signUpCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', 'tracking', '$q', function ($scope, clientConfig, service, queryParser, serviceErrorParser, tracking, $q) {
        $scope.signUpData = {
            mobile: '',
            verificationCode: '',
            password: '',
            captchaId: '',
            captcha: '',
            agreed: false
        };

        $scope.queryString = location.search;

        function bindWechatAccount(member_id) {
            var query = queryParser.parse();

            if (query.token) {
                return service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                    token: query.token,
                    member_id: member_id
                });
            } else {
                return $q.resolve(member_id);
            }
        }

        $scope.signUp = function () {
            tracking.send('sign-up.register', $scope.signUpData);
            service.put(clientConfig.serviceUrls.sso.signUp.frontEnd, $scope.signUpData)
                .then(bindWechatAccount)
                .then(function (member_id) {
                    tracking.send('sign-up.register.done', {member_id: member_id});

                    return service.post(clientConfig.serviceUrls.sso.signIn.frontEnd, {
                        value: $scope.signUpData.mobile,
                        password: $scope.signUpData.password,
                        return_url: encodeURIComponent(location.pathname + '?step=2')
                    });
                })
                .catch(function (reason) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                    tracking.send('sign-up.register.error', reason);
                });
        };
    }])
    .controller('infoCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', '$q', 'tracking', '$http', 'Grades', function ($scope, clientConfig, service, queryParser, serviceErrorParser, $q, tracking, $http, Grades) {
        $scope.infoData = {
            name: '',
            gender: null,
            grade: null
        };

        $scope.grades = Grades;

        $scope.submitInfo = function () {
            tracking.send('sign-up.step2.saveInfo.click', $scope.infoData);
            $q.all([service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                real_name: $scope.infoData.name,
                gender: $scope.infoData.gender
            }), $http.put(clientConfig.serviceUrls.buzz.profile.education.frontEnd, {
                grade: '' + $scope.infoData.grade
            })])
                .then(function (result) {
                    console.log(result);

                    tracking.send('sign-up.step2.saveInfo.done', result);
                    location.href = '/';
                })
                .catch(function (error) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(error);
                    tracking.send('sign-up.step2.saveInfo.error', error);
                });
        };
    }])
;