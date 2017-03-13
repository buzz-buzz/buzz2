angular.module('accountModule', ['clientConfigModule', 'buzzHeaderModule', 'educationModule', 'servicesModule', 'errorParserModule', 'formModule'])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.translations('en', {}).translations('zh', {
            'missing validation code': '图形验证码不正确',
            'validate not pass': '图形验证码未通过，请重新输入',
            "Password can't be empty": '密码不能为空',
            'Identity already existed': '该手机号已注册',
            'sms validate error': '短信验证码不正确',
            'Invalid mobile': '手机号码不正确或者暂未被支持'
        });
        $translateProvider.preferredLanguage('zh');
    }])
    .controller('viewAccountCtrl', ['$http', 'clientConfig', '$rootScope', '$scope', 'GenderDisplay', 'GradeDisplay', 'LevelDisplay', function ($http, clientConfig, $rootScope, $scope, GenderDisplay, GradeDisplay, LevelDisplay) {
        $scope.expanded = false;
        $scope.expand = function(val) {
            $scope.expanded = val;
        };
        $rootScope.$watch('profile', function (newValue, oldValue) {
            if (newValue) {
                $scope.displayGender = GenderDisplay[newValue.gender];
            }
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.latestAllEducation.frontEnd)
            .then(function (result) {
                $scope.info = {
                    grade: result.data.grade,
                    displayGrade: GradeDisplay[result.data.grade],
                    topics: result.data.fav_topics,
                    level: LevelDisplay[result.data.fav_level]
                };
            });

        $scope.showModal = function (id) {
            $rootScope.$emit('modal:show' + id);
        };

        $rootScope.$on('info:updated', function (event, data) {
            if (data.grade) {
                $scope.info.grade = data.grade;
                $scope.info.displayGrade = GradeDisplay[data.grade];
            }

            if (data.gender) {
                $scope.displayGender = GenderDisplay[data.gender];
            }

            if (data.name) {
                $rootScope.profile.real_name = data.name;
            }

            if (data.topics) {
                $scope.info.topics = [data.topics];
            }

            if (data.level) {
                $scope.info.level = LevelDisplay[data.level];
            }

            if (data.mobile) {
                $rootScope.profile.mobile = data.mobile;
            }
        });
    }])
    .controller('infoFormParentCtrl', ['$scope', '$rootScope', 'modalFactory', function ($scope, $rootScope, modalFactory) {
        $scope.step = 2;

        modalFactory.bootstrap($scope, $rootScope, '');
    }])
    .factory('modalFactory', [function () {
        return {
            bootstrap: function ($scope, $rootScope, modalId) {
                console.log('bootstraped ', modalId);
                $scope.showModal = false;
                $scope.hideModal = false;

                $scope.hideTheModal = function () {
                    $scope.hideModal = true;
                    $scope.showModal = false;
                };

                $scope.keepModal = function ($event) {
                    $event.stopPropagation();
                };

                var destroy = $rootScope.$on('modal:show' + modalId, function () {
                    $scope.hideModal = false;
                    $scope.showModal = true;
                });

                var destroy2 = $rootScope.$on('modal:hide', $scope.hideTheModal);

                $scope.$on('$destroy', function () {
                    destroy();
                    destroy2();
                });
            }
        };
    }])
    .controller('mobileModalCtrl', ['$scope', '$rootScope', 'modalFactory', function ($scope, $rootScope, modalFactory) {
        modalFactory.bootstrap($scope, $rootScope, '#mobile');
    }])
    .controller('infoCtrl', ['$http', 'clientConfig', '$scope', '$rootScope', 'Grades', '$q', 'service', 'serviceErrorParser', '$timeout', function ($http, clientConfig, $scope, $rootScope, Grades, $q, service, serviceErrorParser, $timeout) {
        $scope.infoData = {};

        $scope.grades = Grades;

        $http.get(clientConfig.serviceUrls.buzz.categories.list.frontEnd).then(function (result) {
            $scope.topics = result.data.map(function (c) {
                return {
                    key: c.category,
                    name: c.category
                };
            });
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd).then(function (result) {
            $scope.infoData.level = result.data;
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.latestAllEducation.frontEnd).then(function (result) {
            if (result.data.fav_topics && result.data.fav_topics.length) {
                $scope.infoData.topics = result.data.fav_topics[0];
            }

            $scope.infoData.level = result.data.fav_level;
        });

        $rootScope.$watch('profile', function (newValue, oldValue) {
            if (newValue) {
                $scope.infoData.name = newValue.real_name;
                $scope.infoData.gender = newValue.gender;
            }
        });

        $scope.$parent.$parent.$watch('info', function (newVal, oldVal) {
            if (newVal) {
                $scope.infoData.grade = newVal.grade;
            }
        });

        $scope.submitInfo = function () {
            $q.all([service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                real_name: $scope.infoData.name,
                gender: $scope.infoData.gender
            }), $http.put(clientConfig.serviceUrls.buzz.profile.education.frontEnd, {
                grade: '' + $scope.infoData.grade,
                fav_topics: [$scope.infoData.topics],
                fav_level: $scope.infoData.level
            })])
                .then(function (result) {
                    $scope.successMessage = '保存成功！';
                    $scope.$emit('info:updated', $scope.infoData);
                    $timeout(function () {
                        $scope.$emit('modal:hide');
                        $scope.successMessage = '';
                    }, 1000);
                })
                .catch(function (error) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(error);
                });
        };
    }])
    .controller('mobileInfoCtrl', ['$scope', 'clientConfig', '$q', 'Grades', 'service', '$rootScope', '$http', function($scope, clientConfig, $q, Grades, service, $rootScope, $http) {
        var findGrade = function(val) {
            return Grades.find(function(gradeObj) {
                return gradeObj.key === val || val === gradeObj.name;
            });
        };
        $scope.data = {
            name: $rootScope.profile.real_name,
            gender: $rootScope.profile.gender,
            grade: findGrade($scope.info.grade),
            displayGrade: findGrade($scope.info.grade).name
        };
        $scope.grades = Grades;
        $scope.cancel = function() {
            $scope.data.name = $rootScope.profile.real_name;
            $scope.data.gender = $rootScope.profile.gender;
            $scope.data.grade = findGrade($scope.data.displayGrade);
            $scope.$emit("editDone");
        };
        $scope.updateGender = $scope.updateName = function() {
            return service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                real_name: $scope.data.name,
                gender: $scope.data.gender
            }).then(function() {
                $rootScope.profile.real_name = $scope.data.name;
                $rootScope.profile.gender = $scope.data.gender;
                $scope.$emit("editDone");
            }).catch(function() {
                //todo
                $scope.$emit("editDone");
            });
        };
        $scope.updateGrade = function(newName) {
            return $http.put(clientConfig.serviceUrls.buzz.profile.education.frontEnd, {
               grade: $scope.data.grade.key.toString()
           }).then(function() {
                $scope.data.displayGrade = $scope.data.grade.name;
                $scope.$emit("editDone");
            }).catch(function() {
                //todo
                $scope.$emit("editDone");
            });
        };
    }])
    .controller('mobileWidgetCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
        $rootScope.$on("editDone", function() {
            $scope.changeMode(false);
        })
        $scope.editMode = false;
        $scope.changeMode = function(val) {
            if (val) {
                $scope.$emit("editDone");
            }
            $scope.editMode = val;
        };
    }])
    .controller('changeMobileCtrl', ['$scope', function ($scope) {
        $scope.step = 1;
    }])
    .controller('signUpCtrl', ['$scope', 'service', 'clientConfig', '$timeout', 'serviceErrorParser', function ($scope, service, clientConfig, $timeout, serviceErrorParser) {
        $scope.signUpData = {
            mobile: '',
            verificationCode: '',
            captchaId: '',
            captcha: ''
        };

        $scope.signUp = function () {
            service.post(clientConfig.serviceUrls.sso.profile.changeMobile.frontEnd, $scope.signUpData)
                .then(function (res) {
                    $scope.successMessage = '修改成功！';
                    $scope.errorMessage = null;
                    $scope.$emit('info:updated', $scope.signUpData);
                    $timeout(function () {
                        $scope.$emit('modal:hide');
                        $scope.successMessage = '';
                    }, 1000);
                })
                .catch(function (error) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(error);
                    $scope.successMessage = null;
                });
        };
    }])
;
