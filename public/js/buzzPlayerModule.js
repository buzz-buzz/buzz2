angular.module('buzzPlayerModule', ['angularQueryParserModule', 'trackingModule', 'parserModule', 'serviceCacheCoreModule', 'videoParserModule'])
    .run([function () {
        jwplayer.key = 'lG24bAGJCRLF1gi4kajg4EnUKi+ujyUyKMoSNA==';
    }])
    .factory('videoFactory', ['$http', 'timeHelper', function ($http, timeHelper) {
        function extra($scope) {
            return {
                seconds: $scope.seconds,
                isFullScreen: $scope.fullScreen || false
            };
        }

        function getData(event, videoInfo, $scope) {
            return angular.extend({}, videoInfo, event, extra($scope));
        }


        function trackVideo($scope, mainVideo, tracking, videoInfo) {
            mainVideo.onPlay(function (event) {
                tracking.sendX('play.video.playBtn.click', getData(event, videoInfo, $scope));
            });

            mainVideo.onPause(function (event) {
                tracking.sendX('play.video.pauseBtn.click', getData(event, videoInfo, $scope))
            });

            mainVideo.onSeek(function (event) {
                tracking.sendX('play.video.seekBtn', getData(event, videoInfo, $scope));
            });

            mainVideo.onFullscreen(function (event) {
                $scope.fullScreen = event.fullscreen;
                $scope.$apply();

                tracking.sendX('play.video.fullScreenBtn.clicked', getData(event, videoInfo, $scope));
            });

            mainVideo.onQualityChange(function (event) {
                tracking.sendX('play.video.definitionBtn', angular.extend({}, getData(event, videoInfo, $scope), {
                    toDefinition: event.levels[event.currentQuality].label
                }));
            });

            mainVideo.onMute(function (event) {
                tracking.sendX('play.video.muteBtn.click', getData(event, videoInfo, $scope));
            });

            mainVideo.onVolume(function (event) {
                tracking.sendX('play.video.volumnBtn', getData(event, videoInfo, $scope));
            });

            mainVideo.onComplete(function (event) {
                tracking.sendX('play.video.end', getData(event, videoInfo, $scope));
                window.parent.postMessage('video:end//' + JSON.stringify(getData(event, videoInfo, $scope)), window.parent.location.href);
            });
        }

        function updateVideoTime(mainVideo, $scope) {
            mainVideo.onTime(function (event) {
                $scope.currentTime = timeHelper.convertSecondsToHHMMSS(event.position);
                $scope.seconds = event.position;
                $scope.$apply();
            });
        }

        function emitVideoPlayedMessage(mainVideo, videoInfo, $scope) {
            var played = false;
            mainVideo.onPlay(function (event) {
                if (!played) {
                    window.parent.postMessage('video:played//' + JSON.stringify(getData(event, videoInfo, $scope)), window.parent.location.href);

                    played = true;
                }
            });
        }

        function restrictVideoPlaying(currentPos, range, mainVideo, videoInfo, $scope) {
            if (Number(currentPos) < Number(range.start)) {
                mainVideo.seek(Number(range.start));
                mainVideo.play(true);
            }

            if (Number(currentPos) >= Number(range.end)) {
                mainVideo.play(false);

                window.parent.postMessage('video:restricted//' + JSON.stringify(getData(event, videoInfo, $scope)), window.parent.location.href);
            }
        }

        function emitVideoEightyPlayedMessage(videoInfo, $scope) {
            var playedList = sessionStorage.getItem('playedList');

            if (playedList && playedList.indexOf(videoInfo.lesson_id) !== -1) {
                return;
            }

            if (playedList) {
                playedList = playedList + ',' + videoInfo.lesson_id;
            } else {
                playedList = videoInfo.lesson_id;
            }

            sessionStorage.setItem('playedList', playedList);
            window.parent.postMessage('video:eightyPercentPlayed//' + JSON.stringify(getData(event, videoInfo, $scope)), window.parent.location.href);

        }

        return {
            listenVideo: function ($scope, mainVideo, tracking, query, smil) {
                var videoInfo = {
                    date: query.date,
                    category: query.cat,
                    level: query.level,
                    lesson_id: query.lesson_id,
                    smil: smil
                };

                trackVideo($scope, mainVideo, tracking, videoInfo);
                updateVideoTime(mainVideo, $scope);
                emitVideoPlayedMessage(mainVideo, videoInfo, $scope);

                mainVideo.onTime(function (event) {
                    if (event.type === 'time' && Number(event.position) > 180) {
                        emitVideoEightyPlayedMessage(videoInfo, $scope);
                    }
                });


                $scope.playTo = function (subtitle) {
                    var startSeconds = timeHelper.convertHHMMSSToSeconds(subtitle.startTime);

                    function seekAndPlay() {
                        mainVideo.seek(startSeconds);
                        mainVideo.play(true);
                        tracking.sendX('play.speakerBtn.click', angular.extend({}, getData(null, videoInfo, $scope), subtitle));
                    }

                    seekAndPlay();
                };

                $http.get('/service-proxy/video/playable').then(function (result) {
                    if (!result.data || (!result.data.start && !result.data.end)) {
                        return;
                    }

                    mainVideo.onPlay(function (event) {
                        var pos = mainVideo.getPosition();
                        restrictVideoPlaying(pos, result.data, mainVideo, videoInfo, $scope);
                    });

                    mainVideo.onTime(function (event) {
                        if (event.type === 'time') {
                            restrictVideoPlaying(event.position, result.data, mainVideo, videoInfo, $scope);
                        }
                    });

                    mainVideo.onSeek(function (event) {
                        // mainVideo.seek(event.position);
                    });
                });
            }
        };
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'queryParser', '$timeout', '$sce', 'tracking', 'videoFactory', 'vocabularyParser', 'api', 'highlightParser', 'subTitleParser', function ($scope, $rootScope, $http, queryParser, $timeout, $sce, tracking, videoFactory, vocabularyParser, api, highlightParser, subTitleParser) {
        $scope.$sce = $sce;

        var query = queryParser.parse();

        $http.get(query.video_path)
            .then(function (result) {
                window.parent.postMessage('videoData:got//' + JSON.stringify(result.data), window.parent.location.href);

                return result.data;
            })
            .then(function (smil) {
                var mainVideo = jwplayer('main-video').setup({
                    height: document.querySelector('.video-wrapper').offsetHeight,
                    width: '100%',
                    playlist: [{
                        // title: smil.title,
                        description: smil.description,
                        image: smil.image === 'http://source.bridgeplus.cn/image/png/buzz-poster.png' ? (smil.image = '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png') :
                            (smil.image.replace('http://', '//').replace('https://', '//') || '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png'),
                        stretching: "none",
                        sources: smil.switch.map(function (s) {
                            return {
                                file: s.src.replace('http://', '//').replace('https://', '//'),
                                label: s.title,
                                default: s.default,
                                image: s.image.replace('http://', '//').replace('https://', '//') || '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png'
                            };
                        })
                    }]
                });

                videoFactory.listenVideo($scope, mainVideo, tracking, query, smil);

                $scope.videoTitle = smil.title;

                if (smil.subtitle) {
                    smil.subtitle = smil.subtitle.replace('http://', '//').replace('https://', '//');

                    api.get(smil.subtitle).then(function (result) {
                        var subtitles = result.data;

                        $scope.subtitles = subTitleParser.parse(subtitles);
                    }).then(function () {
                        if (query.new_words_path) {
                            $http.get(query.new_words_path).then(function (result) {
                                var newWords = result.data;
                                var highlights = highlightParser.parse(newWords);

                                var rules = new RegExp("(" + highlights.join("|") + ")", "g");
                                for (var j = 0; j < $scope.subtitles.length; j++) {
                                    $scope.subtitles[j].text = $scope.subtitles[j].text.replace(rules, function (newWord) {
                                        return '<strong class="newWord">' + newWord + '</strong>';
                                    });
                                }
                            });
                        }
                    });
                }
            });
    }]);