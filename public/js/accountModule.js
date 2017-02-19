angular.module('accountModule', ['clientConfigModule', 'buzzHeaderModule', 'educationModule', 'servicesModule', 'errorParserModule'])
    .controller('viewAccountCtrl', ['$http', 'clientConfig', '$rootScope', '$scope', 'GenderDisplay', 'GradeDisplay', 'LevelDisplay', function ($http, clientConfig, $rootScope, $scope, GenderDisplay, GradeDisplay, LevelDisplay) {
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

        $scope.showModal = function () {
            $rootScope.$emit('modal:show');
        };

        $rootScope.$on('info:updated', function (event, data) {
            $scope.info.grade = data.grade;
            $scope.info.displayGrade = GradeDisplay[data.grade];
            $scope.displayGender = GenderDisplay[data.gender];
            $rootScope.profile.real_name = data.name;
            $scope.info.topics = [data.topics];
            $scope.info.level = LevelDisplay[data.level];
        });
    }])
    .controller('infoFormParentCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.step = 2;
        $scope.showModal = false;
        $scope.hideModal = false;

        $scope.hideTheModal = function () {
            $scope.hideModal = true;
            $scope.showModal = false;
        };

        $scope.keepModal = function ($event) {
            $event.stopPropagation();
        };

        var destroy = $rootScope.$on('modal:show', function () {
            $scope.hideModal = false;
            $scope.showModal = true;
        });

        var destroy2 = $rootScope.$on('modal:hide', $scope.hideTheModal);

        $scope.$on('$destroy', function () {
            destroy();
            destroy2();
        });
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
;