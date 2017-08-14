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
            '/sign-up?step=2': '注册成功，正在跳转至信息填写页面',
            '/m/sign-up?step=2': '注册成功，正在跳转至信息填写页面'
        });
        $translateProvider.preferredLanguage('zh');
    }])
    .controller('signUpParentCtrl', ['$scope', 'queryParser', 'tracking', function ($scope, queryParser, trackingX) {
        $scope.step = queryParser.get('step') || 1;

        trackingX.sendX('sign-up', {
            step: $scope.step,
        });

        var query = queryParser.parse();

        $scope.bindMobileMode = !!query.token;
    }])
    .controller('signUpCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', 'tracking', '$timeout', function ($scope, clientConfig, service, queryParser, serviceErrorParser, tracking, $timeout) {
        $scope.signUpData = {
            mobile: '',
            verificationCode: '',
            password: '',
            captchaId: '',
            captcha: '',
            agreed: true,
            invite_code: queryParser.get('trk_tag') || sessionStorage.getItem('trk_tag'),
            channel: queryParser.get('channel'),
            app_name: 'buzz'
        };

        $scope.queryString = location.search;

        $scope.signUp = function () {
            tracking.sendX('sign-up.register', $scope.signUpData);
            service.put(clientConfig.serviceUrls.sso.signUp.frontEnd, $scope.signUpData)
                .then(function (member_id) {
                    tracking.sendX('sign-up.register.done', {
                        member_id: member_id,
                        channel: queryParser.get('channel')
                    });

                    return service.post(clientConfig.serviceUrls.sso.signIn.frontEnd, {
                        value: $scope.signUpData.mobile,
                        password: $scope.signUpData.password,
                        token: queryParser.get('token'),
                        return_url: encodeURIComponent(location.pathname + '?step=2')
                    });
                })
                .catch(function (reason) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                    $scope.successMessage = $scope.message = null;
                    tracking.sendX('sign-up.register.error', reason);
                });
        };

        $scope.errDone = function () {
            $scope.errorMessage = null;
        };

        $scope.$watch('errorMessage', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $scope.errorMessage = null;
                }, 3000)
            }
        });
    }])
    .controller('infoCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', '$q', 'tracking', '$http', 'Grades', '$timeout', function ($scope, clientConfig, service, queryParser, serviceErrorParser, $q, tracking, $http, Grades, $timeout) {
        $scope.infoData = {
            name: '',
            gender: null,
            grade: null
        };

        $scope.grades = Grades;

        $scope.submitInfo = function () {
            tracking.sendX('sign-up.step2.saveInfo.click', $scope.infoData);
            $q.all([service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                    real_name: $scope.infoData.name,
                    gender: $scope.infoData.gender
                }), $http.put(clientConfig.serviceUrls.buzz.profile.education.frontEnd, {
                    grade: '' + $scope.infoData.grade
                })])
                .then(function (result) {
                    tracking.sendX('sign-up.step2.saveInfo.done', result);
                    location.href = '/';
                })
                .catch(function (error) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(error);
                    tracking.sendX('sign-up.step2.saveInfo.error', error);
                });

            //错误提示方法  用户点击，提示框消失  或者三秒后自动消失
            //用户点击消失
            $scope.errDone = function () {
                $scope.errorMessage = null;
            };

            //3秒后中自动消失
            $scope.$watch('errorMessage', function (newValue, oldValue) {
                console.log(newValue + "," + oldValue);
                if (newValue) {
                    $timeout(function () {
                        $scope.errorMessage = null;
                    }, 3000)
                }
            })
        };
    }]);