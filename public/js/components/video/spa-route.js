angular
    .module('spaModule')
    .run([
        '$rootScope',
        '$location',
        'routerHelper',
        function ($rootScope, $location, routerHelper) {
            $rootScope
                .$on('$routeChangeSuccess', function (ev, current, previous) {
                    $rootScope.back = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        if (previous && history) {
                            history.back();
                        } else {
                            location.href = '/';
                        }
                    };
                });
        }
    ])
    .factory('videoStatus', [
        '$http',
        '$q',
        '$sce',
        function ($http, $q, $sce) {
            return {
                get: function (video_id) {
                    return $http
                        .get('/api/videos/' + video_id)
                        .then(function (result) {
                            var videoInfo = result.data;
                            console.log(videoInfo);
                            if (!videoInfo.raw) {
                                videoInfo.raw = atob(videoInfo.video_path);
                            }

                            if (!videoInfo.pastered) {
                                videoInfo.pastered = videoInfo.video_vfx_path;
                            }

                            console.log(videoInfo);
                            videoInfo.status = 3;
                            videoInfo.score = .8;
                            if (videoInfo.status === 2) {
                                return $q.reject('processing');
                            } else {
                                return $q.resolve(videoInfo);
                            }
                        })
                        .catch(function (reason) {
                            return $q.reject(reason);
                        });
                }
            };
        }
    ])
    .controller('videoPreviewCtrl', [
        '$scope',
        '$routeParams',
        '$http',
        'subTitleParser',
        '$rootScope',
        '$location',
        'requestTransformers',
        '$timeout',
        'videoStatus',
        'api',
        function ($scope, $routeParams, $http, subTitleParser, $rootScope, $location, requestTransformers, $timeout, videoStatus, api) {
            api
                .get('/service-proxy/buzz/video/info/:video_id'.replace(':video_id', $routeParams.video_id))
                .then(function (videoInfo) {
                    if (videoInfo.data && videoInfo.data.video_path) {
                        $scope.videoStatus = {
                            description: '',
                            raw: decodeURIComponent(atob(videoInfo.data.video_path))
                        };

                        angular
                            .element(document)
                            .ready(function () {
                                $scope.$broadcast('//video-info:got', $scope.videoStatus);
                            });
                    }
                });

            $scope.$watch('errorMessage', function (newValue, oldValue) {
                if (newValue) {
                    $timeout(function () {
                        $scope.errorMessage = '';
                    }, 2000)
                }
            });

            $scope.tryAgain = function () {
                $location.path('/video');
            };

            $scope.sureUpload = function () {
                $location.path('/video-player/' + $routeParams.video_id);
            };
        }
    ])
    .controller('videoPlayerCtrl', [
        '$scope',
        '$routeParams',
        '$rootScope',
        '$http',
        'clientConfig',
        '$timeout',
        'api',
        'videoStatus',
        '$location',
        '$sce',
        '$q',
        'weixin',
        function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, videoStatus, $location, $sce, $q, weixin) {
            $scope.hideVideo = false;
            $scope.videoTitle = true;

            function showProcessing() {
                $('#dimmer-processing').dimmer('show');
                $scope.hideVideo = true;
            }

            function hideProcessing() {
                $('#dimmer-processing').dimmer('hide');
                $scope.hideVideo = false;
            }

            function showError() {
                $('#dimmer-error').dimmer('show');
                $scope.hideVideo = true;
            }

            function hideError() {
                $('#dimmer-error').dimmer('hide');
                $scope.hideVideo = false;
            }

            function showGoodScoreDimmer() {
                $timeout(function () {
                    $('#dimmer-good-score').dimmer('show');
                    $scope.hideVideo = true;
                }, 1000);
            }

            function hideGoodScoreDimmer() {
                $('#dimmer-good-score')
                    .dimmer('toggle')
                    .dimmer('hide');
                $scope.hideVideo = false;
            }

            function showBadScoreDimmer() {
                $('#dimmer-bad-score')
                    .dimmer({
                        closable: true
                    })
                    .dimmer('show');
                $scope.hideVideo = true;
            }

            function showOffLineDimmer() {
                $('#dimmer-off-line').dimmer('show');
                $scope.hideVideo = true;
            }

            function getVideoStatus() {
                $scope.loading = true;
                //get video info
                videoStatus
                    .get($routeParams.video_id)
                    .then(function (status) {
                        if (status.status !== 0) {
                            hideProcessing();
                            hideError();
                            $scope.videoStatus = status;
                            $scope.$broadcast('//video-info:got', status);
                            if ($scope.videoStatus.score && parseFloat($scope.videoStatus.score)) {
                                if ($scope.videoStatus.score < 1) {
                                    $scope.videoStatus.score = parseInt(parseFloat($scope.videoStatus.score) * 100);
                                }
                                if ($scope.videoStatus.score > 30) {
                                    showGoodScoreDimmer();
                                } else {
                                    showBadScoreDimmer();
                                }
                            }
                            hideProcessing();
                            hideError();
                        } else {
                            showOffLineDimmer();
                        }
                    })
                    .catch(function (reason) {
                        if (reason === 'processing') {
                            showProcessing();

                            $timeout(function () {
                                getVideoStatus();
                            }, 15000);
                        } else {
                            showError();
                        }
                    })
                    .finally(function () {
                        $scope.loading = false;
                    });
            }

            $scope.closeVideoGrade = function () {
                if ($scope.videoStatus.score > 30) {
                    console.log('======hide good score======');
                    hideGoodScoreDimmer();
                } else {
                    $location.path('/video');
                }
            };

            $scope.doNothing = function () {
                event.preventDefault();
            };

            $rootScope.shareToFriends = function () {
                $scope.loading = true;
                angular
                    .element(document)
                    .ready(function () {
                        weixin
                            .ready()
                            .then(function () {
                                $scope.loading = false;
                                document
                                    .getElementById('video-uploaded')
                                    .style
                                    .opacity = '0';
                                $('#dimmer-video').dimmer('show');
                            })
                            .catch(function (reason) {
                                $scope.loading = false;
                                alert(reason);
                            });
                    });
            };
            $rootScope.closeDimmer = function () {
                document
                    .getElementById('video-uploaded')
                    .style
                    .opacity = '1';
                $('#dimmer-video').dimmer('hide');
            };
            $scope.gotoVideoRecord = function () {
                $location.path('/video');
            };

            getVideoStatus();
            $scope.$on('//video-player:got', function (event, videoPlayer) {
                videoPlayer
                    .onPlay(function () {
                        $scope.videoTitle = false;
                        $scope.$apply();
                    })

            });

            $scope.refreshStatus = getVideoStatus;
            $scope.$watch('hideVideo', function (newVal, oldVal) {
                if (newVal) {
                    document
                        .getElementById('video-uploaded')
                        .style
                        .opacity = 0;
                } else {
                    document
                        .getElementById('video-uploaded')
                        .style
                        .opacity = 1;
                }
            });
        }
    ])
    .controller('videoShareCtrl', [
        '$scope',
        '$routeParams',
        '$rootScope',
        '$http',
        'clientConfig',
        '$timeout',
        'api',
        '$q',
        'weixin',
        function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, $q, weixin) {
            //share to friends
            var sharable = {
                title: '邀请你看TA的自拍秀',
                desc: '我在Buzzbuzz自拍了英语视频，快来看看吧',
                link: location
                    .href
                    .replace('video-player', 'video-share'),
                imgUrl: 'https://resource.buzzbuzzenglish.com/new_buzz_logo1.png'
            };

            function wechatSharable(sharable) {
                try {
                    weixin
                        .ready()
                        .then(function () {
                            wx.onMenuShareTimeline(angular.extend({}, sharable, {
                                title: sharable.title + ' ' + sharable.desc
                            }));

                            wx.onMenuShareAppMessage(angular.extend({}, sharable));

                        });
                } catch (ex) {
                    console.error(ex);
                }
            }

            handleProfile(null, $rootScope.profile);

            function handleProfile(event, profile) {
                if (profile) {

                    sharable.link = sharable.link + '?trk_tag=' + profile.invite_code;
                    sharable.title = profile.display_name + sharable.title;
                    if (profile.avatar) {
                        sharable.imgUrl = profile.avatar;
                    }
                }
                wechatSharable(sharable);
            }

            $rootScope.$on('//profile:got', handleProfile);

            function videoInfoGet() {
                var dfd = $q.defer();
                $scope.$on('//video-info:got', function (event, status) {
                    dfd.resolve(status);
                });
                return dfd.promise;
            }

            videoInfoGet().then(function (status) {
                if (status.poster) {
                    sharable.imgUrl = status.poster;
                }
            });
        }
    ])
    .controller('videoShareFriendCtrl', [
        '$scope',
        '$routeParams',
        '$rootScope',
        '$http',
        'clientConfig',
        '$timeout',
        'api',
        'videoStatus',
        '$location',
        'weixin',
        function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, videoStatus, $location, weixin) {
            $scope.hideVideo = false;
            $scope.isSharePage = true;

            function showProcessing() {
                $('#dimmer-processing').dimmer('show');
                $scope.hideVideo = true;
            }

            function hideProcessing() {
                $('#dimmer-processing').dimmer('hide');
                $scope.hideVideo = false;
            }

            function showError() {
                $('#dimmer-error').dimmer('show');
                $scope.hideVideo = true;
            }

            function hideError() {
                $('#dimmer-error').dimmer('hide');
                $scope.hideVideo = false;
            }

            function showGoodScoreDimmer() {
                $timeout(function () {
                    $('#dimmer-good-score').dimmer('show');
                    $scope.hideVideo = true;
                }, 1000);
            }

            function hideGoodScoreDimmer() {
                $('#dimmer-good-score')
                    .dimmer('toggle')
                    .dimmer('hide');
                $scope.hideVideo = false;
            }

            function showBadScoreDimmer() {
                $('#dimmer-bad-score')
                    .dimmer({
                        closable: true
                    })
                    .dimmer('show');
                $scope.hideVideo = true;
            }

            function showOffLineDimmer() {
                $('#dimmer-off-line').dimmer('show');
                $scope.hideVideo = true;
            }

            function updateLikesStatus() {
                Array.prototype.contains = function (item) {
                    for (var i in this) {
                        if (this[i] == item) return true;
                    }
                    return false;
                };

                //读member_id
                var strCookie = document.cookie;
                var arrCookie = strCookie.split(";");

                var member_id;
                if(arrCookie.length > 0){
                    for (var i = 0; i < arrCookie.length; i++) {
                        var arr = arrCookie[i].split("=");
                        if ("mid" == arr[0]) {
                            member_id = arr[1];
                            break;
                        }
                    }
                }

                if(!member_id){
                    member_id = '00000000-0000-0000-0000-000000000000';
                }

                if ($scope.likes && $scope.likes.length && $scope.likes.contains(member_id)) {
                    document.getElementById('thumbsUp').style.color = '#f7b52a';
                } else {
                    document.getElementById('thumbsUp').style.color = 'white';
                }
            }
            $scope.keepModal = function ($event) {
                $event.stopPropagation();
            };

            $scope.closeVideoGrade = function () {
                if ($scope.videoStatus.score > 30) {
                    hideGoodScoreDimmer();
                } else {
                    $location.path('/video');
                }
            };

            $scope.closeLoginAskDimmer = function(){
                document.getElementById('login-ask').style.display = 'none';
                document.getElementById('login-ask').style.opacity = '0';
                console.log('====hello====');
                document
                    .getElementById('video-uploaded')
                    .style
                    .opacity = 1;
            };

            $scope.Login = function(){
                location.href = '/sign-in';
            };
            //video_id get video info
            videoStatus
                .get($routeParams.video_id)
                .then(function (status) {
                    updateLikesStatus();
                    if (status.status !== 0) {
                        hideProcessing();
                        hideError();
                        $scope.videoStatus = status;
                        $scope.$broadcast('//video-info:got', status);
                        if ($scope.videoStatus.score && parseFloat($scope.videoStatus.score)) {
                            if ($scope.videoStatus.score < 1) {
                                $scope.videoStatus.score = parseInt(parseFloat($scope.videoStatus.score) * 100);
                            }
                            if ($scope.videoStatus.score > 30) {
                                showGoodScoreDimmer();
                            } else {
                                showBadScoreDimmer();
                            }
                        }
                        hideProcessing();
                        hideError();
                    } else {
                        showOffLineDimmer();
                    }
                })
                .catch(function (reason) {
                if (reason === 'processing') {
                    showProcessing();
                } else {
                    console.log('=====video error=====');
                    console.log(reason);
                    showError();
                }
            });

            $scope.shareToFriends = function () {
                $scope.loading = true;
                angular
                    .element(document)
                    .ready(function () {
                        weixin
                            .ready()
                            .then(function () {
                                $scope.loading = false;
                                document
                                    .getElementById('video-uploaded')
                                    .style
                                    .opacity = 0;
                                $('#dimmer-video').dimmer('show');
                            })
                            .catch(function (reason) {
                                $scope.loading = false;
                                alert(reason);
                            });
                    });
            };
            $rootScope.closeDimmer = function () {
                document
                    .getElementById('video-uploaded')
                    .style
                    .opacity = '1';
                $('#dimmer-video').dimmer('hide');
            };
            $scope.playVideo = function () {
                //$location.path('/video');
                location.href = '/video';
            };
            $scope.$on('//video-player:got', function (event, videoPlayer) {
                videoPlayer
                    .onPlay(function () {
                        $scope.videoShare = true;
                        $scope.$apply();
                    })
            });

            //thumbs up
            $scope.thumbsUp = function(){
                $http.post('/service-proxy/buzz/video/info/thumbs/' + $routeParams.video_id )
                    .then(function(response){
                        //获取like list
                        if(response && response.data && response.data === 'no member_id'){
                            //弹出登录框
                            document.getElementById('login-ask').style.opacity = 1;
                            document.getElementById('login-ask').style.display = 'block';
                            document
                                .getElementById('video-uploaded')
                                .style
                                .opacity = '0';
                        }else{
                            $scope.likes = response.data;
                            updateLikesStatus();
                        }
                    });
            };
        }
    ])
    .controller('jwPlayerCtrl', [
        '$scope',
        '$routeParams',
        '$http',
        'subTitleParser',
        '$rootScope',
        '$location',
        'requestTransformers',
        '$timeout',
        '$q',
        function ($scope, $routeParams, $http, subTitleParser, $rootScope, $location, requestTransformers, $timeout, $q) {
            function onLoadedMetaData() {
                var dfd = $q.defer();

                $('#video-uploaded').bind('loadedmetadata', function () {
                    dfd.resolve(this);
                });

                $('#video-uploaded').bind('onprogress', function () {
                    dfd.notify();
                });

                return dfd.promise;
            }

            $q.all([videoInfoGet(), onLoadedMetaData()])
                .then(function (results) {
                    var status = results[0];
                    var metaData = results[1];

                    var options = {
                        width: '100%',
                        aspectratio: metaData.videoWidth + ':' + metaData.videoHeight,
                        playlist: [{
                            description: status.description,
                            image: status.poster || '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                            stretching: 'none',
                            sources: [{
                                file: status.raw + '.mp4',
                                image: status.poster || '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                                label: '原始文件'
                            }]
                        }]
                    };
                    if (status.vtt) {
                        options.playlist[0].tracks = [{
                            file: status.vtt,
                            kind: 'subtitles',
                            label: 'English',
                            'default': true
                        }];
                    }
                    if (status.pastered) {
                        options
                            .playlist[0]
                            .sources
                            .push({
                                file: status.pastered + '.mp4',
                                image: status.poster || '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                                label: '贴纸效果',
                                'default': true
                            });
                    }
                    var video = document.getElementById('video-uploaded');
                    if (video.currentTime === 0 || video.ended) {
                        var videoPlayer = jwplayer('video-uploaded').setup(options);
                        $scope.$emit('//video-player:got', videoPlayer)
                    }
                });

            function videoInfoGet() {
                var dfd = $q.defer();
                $scope.$on('//video-info:got', function (event, status) {
                    dfd.resolve(status);
                });
                return dfd.promise;
            }
        }
    ]);