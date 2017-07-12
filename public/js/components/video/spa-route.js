angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/video', {
                templateUrl: 'video.html',
                controller: 'videoCtrl',
                controllerAs: 'videoCtrl'
            })
            ;

        $routeProvider.otherwise('/video');
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'requestTransformers', function ($scope, $rootScope, $http, requestTransformers) {
        $scope.formData = { video: null };

        $scope.uploadVideo = function () {
            var file = document.querySelector('input[id=video-file]').files[0];

            if (file) {
                $http.put('/videos', {
                    file: file,
                    'x:category': 'upload-' + Math.random().toString()
                }, {
                        headers: {
                            'X-Requested-With': undefined,
                            'Content-Type': undefined
                        },
                        transformRequest: requestTransformers.transformToFormData
                    }).then(function (res) {
                        console.log(res);
                        alert(res.data);
                    }).catch(function (reason) {
                        console.log(reason);
                        alert(reason.data);
                    });
            } else {
                console.log('empty file');
            }
        };
    }])
    ;
