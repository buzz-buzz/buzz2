angular.module('signUpModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule', 'errorParserModule', 'ui.select'])
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
    .directive('captcha', ['service', 'clientConfig', function (service, clientConfig) {
        var captchaServiceDomain = '//' + clientConfig.captcha.host + ':' + clientConfig.captcha.port;

        return {
            restrict: 'A',
            require: 'ngModel',
            template: '<img ng-src="{{captchaImageUrl}}" ng-click="refreshCaptcha()" style="max-height: 100%;">',
            link: function ($scope, $element, attrs, ngModel) {
                function errorHandler(res) {
                    console.error(res);
                }

                var refreshing = false;

                function refreshCaptcha(successCallback, isInit) {
                    if (refreshing) {
                        return;
                    }

                    refreshing = true;

                    service.jsonp(captchaServiceDomain + '/captcha/generator/p?callback=JSON_CALLBACK&appid=bplus')
                        .then(function (result) {
                            $scope.captchaImageUrl = captchaServiceDomain + result.url;
                            ngModel.$setViewValue(result.id);

                            if (typeof successCallback === 'function') {
                                successCallback();
                            }
                        })
                        .catch(errorHandler)
                        .finally(function () {
                            refreshing = false;
                        });
                }

                $scope.refreshCaptcha = refreshCaptcha;

                refreshCaptcha();
            }
        };
    }])
    .directive('resendVerification', ['service', 'serviceErrorParser', '$rootScope', '$timeout', 'clientConfig', function (service, serviceErrorParser, $rootScope, $timeout, clientConfig) {
        return {
            template: '<button class="yellow button verification" type="button" ng-click="sendVerificationCode()" ng-class="{\'loading\': sendingVerificationCode}" ng-disabled="!allowSendingVerification()" style="font-size: small;">{{verificationCodeButtonText}}</button>',
            replace: true,
            link: function ($scope, $element, attrs) {
                var countDownInterval = 60;
                var countDown = countDownInterval;

                $scope.changeMobileData = {};

                $scope.allowSendingVerification = function () {
                    return $scope.allowGetCode && /\d+/.test($scope.signUpData.mobile) && $scope.signUpData.captcha;
                };

                $scope.verificationCodeButtonText = '';

                function updateButtonText(text) {
                    $scope.verificationCodeButtonText = text;
                }

                function initButtonText() {
                    var message = $scope.verificationButtonClicked ? '再次发送' : '获取手机验证码';
                    updateButtonText(message);
                    $scope.allowGetCode = true;
                }

                function refreshButtonText() {
                    updateButtonText(countDown);
                    $scope.allowGetCode = false;
                }

                function pollUpdateButtonText(roundEndCallback) {
                    refreshButtonText();

                    if (countDown > 0) {
                        $timeout(function () {
                            countDown--;
                            pollUpdateButtonText(roundEndCallback);
                        }, 1000);
                    } else {
                        countDown = countDownInterval;
                        initButtonText();

                        if (typeof roundEndCallback === 'function') {
                            roundEndCallback();
                        }
                    }
                }

                initButtonText();

                $scope.sendingVerificationCode = false;
                $scope.verificationButtonClicked = false;
                $scope.sendVerificationCode = function () {
                    service.executePromiseAvoidDuplicate($scope, 'sendingVerificationCode', function () {
                        return service.put(clientConfig.serviceUrls.sms.sendWithCaptcha.frontEnd, {
                            captchaId: $scope.signUpData.captchaId,
                            captcha: $scope.signUpData.captcha,
                            mobile: $scope.signUpData.mobile
                        });
                    })
                        .then(function (result) {
                            $scope.verificationButtonClicked = true;
                            $rootScope.message = '短信验证码已发送,请注意查收';

                            pollUpdateButtonText(function () {
                                $scope.refreshCaptcha(function () {
                                    $scope.changeMobileData.captcha = '';
                                });
                            });

                            $rootScope.errorMessage = null;
                        })
                        .then(null, function (reason) {
                            $scope.refreshCaptcha();
                            $scope.signUpData.captcha = '';
                            $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                        })
                    ;
                };
            }
        };
    }])
    .controller('signUpParentCtrl', ['$scope', 'queryParser', function ($scope, queryParser) {
        $scope.step = queryParser.get('step') || 1;
    }])
    .controller('signUpCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', function ($scope, clientConfig, service, queryParser, serviceErrorParser) {
        $scope.signUpData = {
            mobile: '',
            verificationCode: '',
            password: '',
            captchaId: '',
            captcha: '',
            agreed: false
        };

        $scope.signUp = function () {
            service.put(clientConfig.serviceUrls.sso.signUp.frontEnd, $scope.signUpData)
                .then(function (member_id) {
                    return service.post(clientConfig.serviceUrls.sso.signIn.frontEnd, {
                        value: $scope.signUpData.mobile,
                        password: $scope.signUpData.password,
                        return_url: encodeURIComponent(location.pathname + '?step=2')
                    });
                })
                .then()
                .catch(function (reason) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                });
        };
    }])
    .controller('infoCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', function ($scope, clientConfig, service, queryParser, serviceErrorParser) {
        $scope.infoData = {
            name: '',
            gender: null,
            grade: null
        };

        $scope.grades = [
            {
                key: '3',
                name: '三年级'
            }, {
                key: '4',
                name: '四年级'
            }, {
                key: '5',
                name: '五年级'
            }, {
                key: '6',
                name: '六年级'
            }, {
                key: '7',
                name: '七年级'
            }, {
                key: '8',
                name: '八年级'
            }, {
                key: '9',
                name: '九年级'
            }
        ];

        $scope.submitInfo = function () {
            var level = $scope.infoData.grade > 6 ? 'A' : 'B';
            location.href = '/my/play?date=2016-11-07&cat=science&level=' + level;
        };
    }])
;