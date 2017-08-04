angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/video', {
                templateUrl: 'video.html',
                controller: 'videoCtrl',
                controllerAs: 'videoCtrl'
            })
            .when('/video-player/:src', {
                templateUrl: 'video-player.html',
                controller: 'videoPlayerCtrl',
                controllerAs: 'videoPlayerCtrl'
            });

        $routeProvider.otherwise('/video');
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'requestTransformers', '$location', '$timeout', function ($scope, $rootScope, $http, requestTransformers, $location, $timeout) {
        $scope.formData = {
            video: null
        };

        $scope.uploadVideo = function () {
            var file = document.querySelector('input[id=video-file]');

            if (file) {
                file = file.files[0];
            }

            if (!file && recordedBlobs && recordedBlobs.length) {
                file = new Blob(recordedBlobs, {
                    type: 'video/webm'
                });
            }

            if (file) {
                $scope.uploading = true;
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
                    if (res.data.isSuccess === false) {
                        throw res;
                    } else {
                        $location.path('/video-player/' + encodeURIComponent('//' + res.data.host + '/' + res.data.key));
                    }
                }).then(null, function (reason) {
                    console.error(reason);
                    $scope.errorMessage = reason.data || '出了错误。';
                }).finally(function () {
                    $scope.uploading = false;
                });
            } else {
                $scope.errorMessage = 'Please record a video first!';
            }
        };

        $scope.$watch('errorMessage', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $scope.errorMessage = '';
                }, 2000)
            }
        });

        $scope.mediaReady = false;
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(function (stream) {
            var video = document.querySelector('video#cam');
            if (video) {
                video.src = window.URL.createObjectURL(stream);
                video.onloadedmetadata = function (e) {

                };
                localMediaStream = stream;
                $scope.mediaReady = true;
                $scope.$apply();
            }
        }).catch(function (err) {
            console.error(err);
            $scope.mediaReady = false;
            $scope.$apply();
        });

        var recordedBlobs = [];
        var mediaRecorder;
        var localMediaStream;
        $scope.playButton = {
            disabled: true
        };
        $scope.recordedVideo = {};
        $scope.stopRecording = function () {
            mediaRecorder.stop();
            console.log('Recorded Blobs: ', recordedBlobs);
            $scope.recordedVideo.controls = true;
            $scope.playButton.disabled = false;
            $scope.countDown = false;
        };

        $scope.startRecording = function () {
            $scope.countDown = true;
            var options = {
                mimeType: 'video/webm;codecs=vp9'
            };
            $scope.times = 40;
            var timer = setInterval(contDown, 1000);

            function contDown() {
                $scope.times--;
                if ($scope.times === 0) {
                    $scope.stopRecording()
                    clearInterval(timer)
                    $scope.countDown = false;
                }
            }

            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + ' is not Supported');
                options = {
                    mimeType: 'video/webm;codecs=vp8'
                };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.log(options.mimeType + ' is not Supported');
                    options = {
                        mimeType: 'video/webm'
                    };
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        console.log(options.mimeType + ' is not Supported');
                        options = {
                            mimeType: ''
                        };
                    }
                }
            }

            try {
                recordedBlobs = [];
                mediaRecorder = new MediaRecorder(localMediaStream, options);
                $scope.recording = true;
            } catch (e) {
                console.error('Exception while creating MediaRecorder: ' + e);
                alert('Exception while creating MediaRecorder: ' +
                    e + '. mimeType: ' + options.mimeType);
                return;
            }
            console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
            mediaRecorder.onstop = handleStop;
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.start(10); // collect 10ms of data
            console.log('MediaRecorder started', mediaRecorder);
        };

        function handleStop() {
            console.log('Recorder stopped: ', event);
            $scope.recording = false;
            $scope.$apply();
        }

        function handleDataAvailable(event) {
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }

            $scope.recording = true;
            $scope.$apply();
        }

        $scope.play = function () {
            var superBuffer = new Blob(recordedBlobs, {
                type: 'video/webm'
            });
            $scope.recordedVideo.src = window.URL.createObjectURL(superBuffer);
        };

        $scope.allowRecording = function () {
            return $scope.mediaReady && !$scope.recording;
        };
    }])
    .controller('videoPlayerCtrl', ['$scope', '$routeParams', '$http', 'subTitleParser', function ($scope, $routeParams, $http, subTitleParser) {
        $scope.videoSrc = decodeURIComponent($routeParams.src);
        console.log($scope.videoSrc);
        $scope.url = location.href;

        var processor = {};

        processor.doLoad = function doLoad() {
            this.video = document.getElementById('video-player');

            this.bg = document.getElementById('mask');

            this.c0 = document.getElementById('c0');
            this.ctx0 = this.c0.getContext('2d');

            this.c1 = document.getElementById('c1');
            this.ctx1 = this.c1.getContext('2d');

            this.c2 = document.getElementById('c2');
            this.ctx2 = this.c2.getContext('2d');

            var self = this;
            this.video.addEventListener('play', function () {
                self.width = self.video.videoWidth;
                self.height = self.video.videoHeight;
                self.c0.width = self.video.videoWidth;
                self.c0.height = self.video.videoHeight;
                self.c1.width = self.video.videoWidth;
                self.c1.height = self.video.videoHeight;
                self.c2.width = self.video.videoWidth;
                self.c2.height = self.video.videoHeight;
                self.c0.style.width = self.video.videoWidth;
                self.c0.style.height = self.video.videoHeight;
                self.c1.style.width = self.video.videoWidth;
                self.c1.style.height = self.video.videoHeight;
                self.c2.style.width = self.video.videoWidth;
                self.c2.style.height = self.video.videoHeight;

                self.timerCallback();
            }, false);
        };

        processor.timerCallback = function timerCallback() {
            if (this.video.paused || this.video.ended) {
                return;
            }
            this.computeFrame();
            var self = this;
            setTimeout(function () {
                self.timerCallback();
            }, 0);
        };

        processor.computeFrame = function computeFrame() {
            this.ctx0.drawImage(this.bg, 0, 0, this.bg.width, this.bg.height, 0, 0, this.width, this.height);

            this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
            var frame = this.ctx1.getImageData(0, 0, this.width, this.height);
            var mask = this.ctx0.getImageData(0, 0, this.width, this.height);
            var l = frame.data.length / 4;

            for (var i = 0; i < l; i++) {
                var j = maskPos(i, this.c1.width, this.c1.height, this.c0.width, this.c0.height);
                if (!headArea(mask.data, j)) {
                    setRGBA(frame.data, i, null, null, null, 0);
                }
            }
            this.ctx2.putImageData(frame, 0, 0);
            this.ctx0.putImageData(mask, 0, 0);
            return;
        };

        function maskPos(i, w, h, w1, h1) {
            var x = i % w;
            var y = Math.floor((i + 1) / w);

            var x1 = Math.round((w1 - w) / 2 + x);
            var y1 = Math.round((h1 - h) / 2 + y);

            var i1 = x1 + y1 * w1;
            return i1;
        }

        function getRGBA(data, i) {
            return {
                r: data[i * 4 + 0],
                g: data[i * 4 + 1],
                b: data[i * 4 + 2],
                a: data[i * 4 + 3]
            };
        }

        function setRGBA(data, i, r, g, b, a) {
            if (r != null) {
                data[i * 4 + 0] = r;
            }
            if (g != null) {
                data[i * 4 + 1] = g;
            }
            if (b != null) {
                data[i * 4 + 2] = b;
            }
            if (a != null) {
                data[i * 4 + 3] = a;
            }
        }

        function headArea(data, pos) {
            var rgba = getRGBA(data, pos);
            return rgba.a === 0;
            // return Math.abs(rgb.r - 204) < 10 && Math.abs(rgb.g - 204) < 10 && Math.abs(rgb.b - 255) < 10;
        }

        $http.get($scope.videoSrc + '.ass').then(function (res) {
            $scope.subtitles = subTitleParser.parse(res.data);
            console.log($scope.subtitles);
        }).catch(function (reason) {
            console.error(reason);
            $scope.subtitle = {
                text: '字幕正在生成中……'
            };
        });

        var video = document.getElementById('video-player');
        video.ontimeupdate = function (event) {
            if (!$scope.subtitle || video.currentTime > $scope.subtitle.endSecond || video.currentTime < $scope.subtitle.startSecond) {
                $scope.subtitle = subTitleParser.findSubtitleBySecond($scope.subtitles, video.currentTime);
                $scope.$apply();
            }
        };

        video.onloadedmetadata = function () {
            processor.doLoad();
        };
    }]);