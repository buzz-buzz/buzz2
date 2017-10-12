angular
    .module('spaModule')
    .run([
        '$rootScope',
        '$location',
        function ($rootScope, $location) {
            $rootScope
                .$on('$routeChangeSuccess', function (ev, current, previous) {
                    $rootScope.back = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        if (previous && history) {
                            history.back();
                        } else {
                            // location.href = '/';
                            $location.path('/photo');
                        }
                    };
                });
        }
    ])
    .controller('photoCtrl', [
        '$scope',
        '$routeParams',
        '$http',
        '$location',
        'requestTransformers',
        '$timeout',
        function ($scope, $routeParams, $http, $location, requestTransformers, $timeout) {
            $scope.photo1Src = '';
            $scope.photo2Src = '';

            $scope.formData = {
                photos: []
            };

            function getAsDataUrl(target, file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $scope[target] = e.target.result;
                    console.log(e.target);
                    $scope.$apply();
                };
                reader.readAsDataURL(file);
            }

            $scope.photoChange = function () {
                var file = document.querySelector('input[id=photo-file]').files[0];
                console.log(file);
                $scope.formData.photos.push(file);
                getAsDataUrl('photo1Src', file);
            };

            $scope.photo2Change = function () {
                var file = document.querySelector('input[id=photo-file-2]').files[0];
                console.log(file);
                $scope.formData.photos.push(file);
                getAsDataUrl('photo2Src', file);
            };

            $scope.upload = function () {
                if ($scope.formData.photos.length === 2) {
                    $scope.uploading = true;

                    $http.post('/photos', {
                        photos: $scope.formData.photos
                    }, {

                        headers: {
                            'X-Requested-With': undefined,
                            'Content-Type': undefined
                        },
                        transformRequest: requestTransformers.transformToFormData
                    }).then(function (result) {
                        console.log(result);
                        $location.path('/photo/' + btoa(result.data));
                    }).catch(function (reason) {
                        $scope.errorMessage = reason.statusText || reason;
                    }).finally(function () {
                        $scope.uploading = false;
                    });
                } else {
                    $scope.errorMessage = 'Please upload 2 photos first!';
                }
            };
        }
    ])
    .controller('resultCtrl', ['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {
        console.log($routeParams);
        $scope.loading = false;
        $scope.resultSrc = '/photos/' + $routeParams.encodedPath;
    }]);