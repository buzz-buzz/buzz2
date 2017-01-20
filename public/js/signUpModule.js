angular.module('signUpModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule', 'errorParserModule', 'ui.select', 'trackingModule'])
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
    .directive('captcha', ['service', 'clientConfig', 'tracking', function (service, clientConfig, tracking) {
        var captchaServiceDomain = '//' + clientConfig.captcha.host + ':' + clientConfig.captcha.port;

        return {
            restrict: 'A',
            require: 'ngModel',
            template: '<img ng-src="{{captchaImageUrl}}" ng-click="refreshCaptcha()" style="max-height: 100%;">',
            link: function ($scope, $element, attrs, ngModel) {
                function errorHandler(res) {
                    console.error(res);
                    tracking.send('sign-up.changeIdentifyCode.error')
                }

                var refreshing = false;

                function refreshCaptcha(successCallback, isInit) {
                    if (refreshing) {
                        return;
                    }

                    refreshing = true;

                    tracking.send('sign-up.changeIdentifyCode');
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
                            tracking.send('sign-up.changeIdentifyCode.done')
                        });
                }

                $scope.refreshCaptcha = refreshCaptcha;

                refreshCaptcha();
            }
        };
    }])
    .directive('resendVerification', ['service', 'serviceErrorParser', '$rootScope', '$timeout', 'clientConfig', 'tracking', function (service, serviceErrorParser, $rootScope, $timeout, clientConfig, tracking) {
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
                    tracking.send('sign-up.identifyPhone');
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
                            tracking.send('sign-up.identifyPhone.done');
                        })
                        .then(null, function (reason) {
                            $scope.refreshCaptcha();
                            $scope.signUpData.captcha = '';
                            $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                            tracking.send('sign-up.identifyPhone.error');
                        })
                    ;
                };
            }
        };
    }])
    .controller('signUpParentCtrl', ['$scope', 'queryParser', 'tracking', function ($scope, queryParser, tracking) {
        $scope.step = queryParser.get('step') || 1;

        tracking.send('sign-up', {
            step: $scope.step
        });
    }])
    .controller('signUpCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', 'tracking', function ($scope, clientConfig, service, queryParser, serviceErrorParser, tracking) {
        $scope.signUpData = {
            mobile: '',
            verificationCode: '',
            password: '',
            captchaId: '',
            captcha: '',
            agreed: false
        };

        $scope.signUp = function () {
            tracking.send('sign-up.register', $scope.signUpData);
            service.put(clientConfig.serviceUrls.sso.signUp.frontEnd, $scope.signUpData)
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
    .controller('infoCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', '$q', 'tracking', function ($scope, clientConfig, service, queryParser, serviceErrorParser, $q, tracking) {
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
            tracking.send('sign-up.step2.saveInfo.click', $scope.infoData);
            $q.all([service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                real_name: $scope.infoData.name,
                gender: $scope.infoData.gender
            }), service.put(clientConfig.serviceUrls.buzz.profile.education.frontEnd, {
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