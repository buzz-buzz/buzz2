angular.module('courseModule', ['servicesModule', 'clientConfigModule'])
    .controller('courseAddCtrl', ['$scope', 'service', 'clientConfig', function ($scope, service, clientConfig) {
        $scope.courseData = {
            category: 'SCIENCE',
            level: null,
            enabled: true,
            title: null,
            description: null,
            subtitle: null,
            newWords: null,
            quizzes: null,
            image: 'http://source.bridgeplus.cn/image/png/buzz-poster.png',
            baseNumber: 100,
            switch: [{
                src: null,
                title: null,
                image: null,
                default: false
            }]
        };

        $scope.removeSwitchItem = function (item) {
            $scope.courseData.switch = $scope.courseData.switch.filter(function (i) {
                return i !== item;
            });
        };

        $scope.addSwitchItem = function () {
            $scope.courseData.switch.push({
                src: null,
                title: null,
                image: null,
                default: false
            });
        };

        $scope.saveCourse = function () {
            if ($scope.view === 'json') {
                switchToFormView();
            }

            service.put(clientConfig.serviceUrls.buzz.admin.course.frontEnd, $scope.courseData)
                .then(function (result) {
                    alert(result);
                }, function (reason) {
                    alert(reason);
                })
            ;
        };

        $scope.view = 'json';

        function switchToFormView() {
            try {
                syncJsonToForm();

                $scope.view = 'form';
            } catch (ex) {
                alert(ex);
            }
        }

        function switchToJsonView() {
            $scope.view = 'json';
            syncFormToJson();
        }

        $scope.switchView = function () {
            if ($scope.view === 'json') {
                switchToFormView();
            } else {
                switchToJsonView();
            }
        };

        function syncJsonToForm() {
            $scope.courseData = JSON.parse($scope.courseJson);
        }

        function syncFormToJson() {
            $scope.courseJson = JSON.stringify($scope.courseData);
        }

        $scope.courseJson = JSON.stringify($scope.courseData);
    }])
;