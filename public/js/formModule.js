angular.module('formModule', ['clientConfigModule', 'servicesModule', 'errorParserModule', 'trackingModule'])
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
                            $scope.successMessage = $rootScope.message = '短信验证码已发送,请注意查收';

                            pollUpdateButtonText(function () {
                                $scope.refreshCaptcha(function () {
                                    $scope.changeMobileData.captcha = '';
                                });
                            });

                            $scope.errorMessage = $rootScope.errorMessage = null;
                            tracking.send('sign-up.identifyPhone.done');
                        })
                        .then(null, function (reason) {
                            $scope.refreshCaptcha();
                            $scope.signUpData.captcha = '';
                            $scope.errorMessage = serviceErrorParser.getErrorMessage(reason);
                            $scope.message = null;
                            tracking.send('sign-up.identifyPhone.error');
                        })
                    ;
                };
            }
        };
    }])
;