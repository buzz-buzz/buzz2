angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/video', {
                templateUrl: 'video.html',
                controller: 'videoCtrl',
                controllerAs: 'videoCtrl'
            })
            .when('/video-preview', {
                templateUrl: 'video-preview.html',
                controller: 'videoPreviewCtrl',
                controllerAs: 'videoPreviewCtrl'
            })
            .when('/video-player/:src', {
                templateUrl: 'video-player.html',
                controller: 'videoPlayerCtrl',
                controllerAs: 'videoPlayerCtrl'
            })

        // $routeProvider.otherwise('/video');
    }])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.previousState;
        $rootScope.currentState;
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
            $rootScope.currentState = to.name;
        });

        $rootScope.back = function ($event) {
            if (history.length > 1) {
                history.back();
                $rootScope.$apply();
                $event.preventDefault();
                $event.stopPropagation();
            }
        };
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'requestTransformers', '$location', '$timeout', function ($scope, $rootScope, $http, requestTransformers, $location, $timeout) {
        $scope.formData = {
            video: null,
            subtitle: 'I like drawing, and walking in nature'
        };

        $scope.videoChange = function () {
            var file = document.getElementById('video-file').files[0];
            var url = URL.createObjectURL(file);
            console.log(url);
            $rootScope.videoPrewSrc = url;
            $rootScope.videoFile = file;
            $location.path('/video-preview');
        };

        $scope.uploadVideoToOwnServer = function () {
            var file = document.querySelector('input[id=video-file]').files[0];

            if (file) {
                $scope.uploading = true;
                $http.post('/videos', {
                    file: file,
                    subtitle: $scope.formData.subtitle
                }, {
                    headers: {
                        'X-Requested-With': undefined,
                        'Content-Type': undefined
                    },
                    transformRequest: requestTransformers.transformToFormData
                }).then(function (res) {
                    $location.path('/video-player/' + encodeURIComponent(res.data));
                }).catch(function (reason) {
                    $scope.errorMessage = reason.statusText || reason;
                }).finally(function () {
                    $scope.uploading = false;
                });
            } else {
                $scope.errorMessage = 'Please record a video first!';
            }
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
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
        }

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
    .controller('videoPreviewCtrl', ['$scope', '$routeParams', '$http', 'subTitleParser', '$rootScope', '$location', 'requestTransformers', '$timeout', function ($scope, $routeParams, $http, subTitleParser, $rootScope, $location, requestTransformers, $timeout) {
        //$scope.videoSrc = decodeURIComponent($routeParams.src);

        $scope.videoSrc = $rootScope.videoPrewSrc;
        console.log($scope.videoSrc);
        $scope.url = location.href;

        $scope.formData = {
            video: null,
            subtitle: 'I like drawing, and walking in nature'
        };

        $scope.file = $rootScope.videoFile;

        if (!$scope.file) {
            location.href = '/video';
        }

        $scope.$watch('errorMessage', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $scope.errorMessage = '';
                }, 2000)
            }
        });

        $scope.tryAgain = function () {
            $rootScope.videoFile = undefined;
            $scope.file = undefined;
            location.href = '/video';
        };

        $scope.uploadVideoToOwnServer = function () {
            if ($scope.file) {
                $scope.uploading = true;
                $http.post('/videos', {
                    file: $scope.file,
                    subtitle: $scope.formData.subtitle
                }, {
                    headers: {
                        'X-Requested-With': undefined,
                        'Content-Type': undefined
                    },
                    transformRequest: requestTransformers.transformToFormData
                }).then(function (res) {
                    $location.path('/video-player/' + encodeURIComponent(res.data));
                    //$scope.videoSrc = res.data;
                    document.getElementById('recoedAgain').disabled = true;
                }).catch(function (reason) {
                    $scope.errorMessage = reason.statusText || reason;
                }).finally(function () {
                    $scope.uploading = false;
                });
            } else {
                $scope.errorMessage = 'Please record a video first!';
            }
        };


        var processor = {};

        processor.doLoad = function doLoad() {
            this.video = document.getElementById('video-player');

            this.bg = document.getElementById('mask');

            this.c0 = document.getElementById('c0');
            if (this.c0) {
                this.ctx0 = this.c0.getContext('2d');
            }

            this.c1 = document.getElementById('c1');
            if (this.c1) {
                this.ctx1 = this.c1.getContext('2d');
            }

            this.c2 = document.getElementById('c2');
            if (this.c2) {
                this.ctx2 = this.c2.getContext('2d');
            }

            var self = this;
            this.video.addEventListener('play', function () {
                if (self.c0 && self.c1 && self.c2) {
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
                }
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

        angular.element(document).ready(function () {
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

        });
    }])
    .controller('videoPlayerCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api) {
        $scope.videoSrc = decodeURIComponent($routeParams.src);
        console.log($scope.videoSrc);
        $scope.url = location.href;

        $scope.formData = {
            video: null,
            subtitle: 'I like drawing, and walking in nature'
        };

        $scope.shareToFriends = function () {
            $('#dimmer-video')
                .dimmer('show');
        };

        $scope.closeDimmer = function () {
            $('#dimmer-video')
                .dimmer('hide');
        };

        //share to friends
        api.get(clientConfig.serviceUrls.sso.profile.load.frontEnd)
            .then(function (result) {
                var profile = result.data.result;

                var sharable = {
                    title: '我在Buzzbuzz自拍了英语视频，快来看看吧',
                    desc: profile.display_name + '邀请你看视频',
                    link: location.href,
                    imgUrl: 'https://resource.buzzbuzzenglish.com/wechat-share-friend.jpg'
                };
                $rootScope.wechatSharable = sharable;
            });
        $http.get(clientConfig.serviceUrls.wechat.sign.frontEnd, {
            params: {
                url: encodeURIComponent(location.href)
            }
        }).then(function (result) {
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: result.data.appId, // 必填，公众号的唯一标识
                timestamp: result.data.timestamp, // 必填，生成签名的时间戳
                nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
                signature: result.data.signature, // 必填，签名，见附录1
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });

            function shareToTimelineSuccess(result) {
                if (result.errMsg === 'shareTimeline:ok') {

                } else {

                }
            }

            function shareToTimelineCancel(result) {
                if (result.errMsg === 'shareTimeline:cancel') {

                } else {

                }
            }

            function shareToFriendSuccess(result) {
                if (result.errMsg === 'sendAppMessage:ok') {

                } else {

                }
            }

            function shareToFriendCancel(result) {
                if (result.errMsg === 'sendAppMessage:cancel') {

                } else {}
            }

            wx.ready(function () {
                wx.onMenuShareTimeline(angular.extend({}, sharable, {
                    success: shareToTimelineSuccess,
                    cancel: shareToTimelineCancel,
                    title: sharable.title + ' ' + sharable.desc
                }));

                wx.onMenuShareAppMessage(angular.extend({}, sharable, {
                    success: shareToFriendSuccess,
                    cancel: shareToFriendCancel,
                    title: sharable.title
                }));

                $rootScope.$emit('wx:ready', sharable);
                wx.isReady = true;
            });

            wx.error(function (res) {
                console.error(res);
            });
        });
    }]);