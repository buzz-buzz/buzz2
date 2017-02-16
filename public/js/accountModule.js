angular.module('accountModule', ['clientConfigModule', 'buzzHeaderModule', 'educationModule', 'servicesModule', 'errorParserModule'])
    .controller('viewAccountCtrl', ['$http', 'clientConfig', '$rootScope', '$scope', 'GenderDisplay', 'GradeDisplay', function ($http, clientConfig, $rootScope, $scope, GenderDisplay, GradeDisplay) {
        $rootScope.$watch('profile', function (newValue, oldValue) {
            if (newValue) {
                $scope.displayGender = GenderDisplay[newValue.gender];
            }
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.latestEducation.frontEnd)
            .then(function (result) {
                $scope.info = {
                    grade: result.data,
                    displayGrade: GradeDisplay[result.data]
                };
            });
    }])
    .controller('infoFormParentCtrl', ['$scope', function ($scope) {
        $scope.step = 2;
    }])
    .controller('infoCtrl', ['$http', 'clientConfig', '$scope', '$rootScope', 'Grades', '$q', 'service', 'serviceErrorParser', function ($http, clientConfig, $scope, $rootScope, Grades, $q, service, serviceErrorParser) {
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
                grade: '' + $scope.infoData.grade
            })])
                .then(function (result) {
                    console.log(result);
                    $scope.errorMessage = '保存成功！';
                })
                .catch(function (error) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(error);
                });
        };
    }])
;