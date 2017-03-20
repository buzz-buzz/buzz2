angular.module('buzzPlayerModule', ['angularQueryParserModule', 'trackingModule'])
    .run([function () {
        jwplayer.key = 'lG24bAGJCRLF1gi4kajg4EnUKi+ujyUyKMoSNA==';
    }])
    .factory('videoFactory', ['$http', function ($http) {
        function convertSecondsToHHMMSS(seconds) {
            var t = new Date(1970, 0, 1);
            t.setMilliseconds(seconds * 1000);
            var h = t.getHours();
            var m = t.getMinutes();
            if (m < 10) {
                m = '0' + m;
            }
            var s = t.getSeconds();
            if (s < 10) {
                s = '0' + s;
            }

            var ms = t.getMilliseconds();
            if (ms < 10) {
                ms = '0' + ms;
            }

            return h + ':' + m + ':' + s + '.' + ms;
        }


        function convertHHMMSSToSeconds(time) {
            var parts = time.split(':');
            var s = parts[parts.length - 1];
            var m = parts[parts.length - 2];
            var h = parts[parts.length - 3];

            return Number(h) * 3600 + Number(m) * 60 + Number(s);
        }


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
                tracking.send('play.video.playBtn.click', getData(event, videoInfo, $scope));
            });

            mainVideo.onPause(function (event) {
                tracking.send('play.video.pauseBtn.click', getData(event, videoInfo, $scope))
            });

            mainVideo.onSeek(function (event) {
                tracking.send('play.video.seekBtn', getData(event, videoInfo, $scope));
            });

            mainVideo.onFullscreen(function (event) {
                $scope.fullScreen = event.fullscreen;
                $scope.$apply();

                tracking.send('play.video.fullScreenBtn.clicked', getData(event, videoInfo, $scope));
            });

            mainVideo.onQualityChange(function (event) {
                tracking.send('play.video.definitionBtn', angular.extend({}, getData(event, videoInfo, $scope), {
                    toDefinition: event.levels[event.currentQuality].label
                }));
            });

            mainVideo.onMute(function (event) {
                tracking.send('play.video.muteBtn.click', getData(event, videoInfo, $scope));
            });

            mainVideo.onVolume(function (event) {
                tracking.send('play.video.volumnBtn', getData(event, videoInfo, $scope));
            });
        }

        function updateVideoTime(mainVideo, $scope) {
            mainVideo.onTime(function (event) {
                $scope.currentTime = convertSecondsToHHMMSS(event.position);
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

        function restrictVideoPlaying(currentPos, range, mainVideo) {
            if (Number(currentPos) < Number(range.start)) {
                mainVideo.seek(Number(range.start));
                mainVideo.play(true);
            }

            if (Number(currentPos) >= Number(range.end)) {
                mainVideo.play(false);
            }
        }

        return {
            listenVideo: function ($scope, mainVideo, tracking, query) {
                var videoInfo = {
                    date: query.date,
                    category: query.cat,
                    level: query.level,
                    lesson_id: query.lesson_id
                };

                trackVideo($scope, mainVideo, tracking, videoInfo);
                updateVideoTime(mainVideo, $scope);
                emitVideoPlayedMessage(mainVideo, videoInfo, $scope);

                $scope.playTo = function (subtitle) {
                    var startSeconds = convertHHMMSSToSeconds(subtitle.startTime);

                    function seekAndPlay() {
                        mainVideo.seek(startSeconds);
                        mainVideo.play(true);
                        tracking.send('play.speakerBtn.click', angular.extend({}, getData(null, videoInfo, $scope), subtitle));
                    }

                    seekAndPlay();
                };

                $http.get('/service-proxy/video/playable').then(function (result) {
                    if (!result.data || (!result.data.start && !result.data.end)) {
                        return;
                    }

                    mainVideo.onPlay(function (event) {
                        var pos = mainVideo.getPosition();
                        restrictVideoPlaying(pos, result.data, mainVideo);
                    });

                    mainVideo.onTime(function (event) {
                        if (event.type === 'time') {
                            restrictVideoPlaying(event.position, result.data, mainVideo);
                        }
                    });

                    mainVideo.onSeek(function (event) {
                        // mainVideo.seek(event.position);
                    });
                });
            }
        };
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'queryParser', '$timeout', '$sce', 'tracking', 'videoFactory', function ($scope, $rootScope, $http, queryParser, $timeout, $sce, tracking, videoFactory) {
        $scope.$sce = $sce;

        var query = queryParser.parse();

        $http.get(query.video_path).then(function (result) {
            var smil = result.data;

            var mainVideo = jwplayer('main-video').setup({
                height: document.querySelector('.video-wrapper').offsetHeight,
                width: '100%',
                playlist: [{
                    // title: smil.title,
                    description: smil.description,
                    image: smil.image,
                    stretching: "none",
                    sources: smil.switch.map(function (s) {
                        return {
                            file: s.src,
                            label: s.title,
                            default: s.default,
                            image: s.image
                        };
                    })
                }]
            });

            videoFactory.listenVideo($scope, mainVideo, tracking, query);

            $scope.videoTitle = smil.title;

            if (smil.subtitle) {
                $http.get(smil.subtitle).then(function (result) {
                    var subtitles = result.data;
                    var events = subtitles.split('[Events]');
                    if (events.length < 2) {
                        throw new Error('subtitle not found!');
                    }

                    var dialogues = events[1].split(/[\r\n]/).filter(function (d) {
                        return d && d.indexOf('Format') < 0;
                    });

                    $scope.subtitles = [];
                    for (var i = 0; i < dialogues.length; i++) {
                        var dialogue = dialogues[i];
                        var structure = dialogue.replace(/^Dialogue:\s*/, '').split(',');
                        $scope.subtitles.push({
                            layer: structure[0],
                            startTime: structure[1],
                            endTime: structure[2],
                            style: structure[3],
                            name: structure[4],
                            marginL: structure[5],
                            marginR: structure[6],
                            marginV: structure[7],
                            effect: structure[8],
                            text: structure.slice(9).join(', ')
                        });
                    }
                }).then(function () {
                    if (query.new_words_path) {
                        $http.get(query.new_words_path).then(function (result) {
                            var newWords = result.data;
                            if (newWords.array) {
                                var rules = new RegExp("(" + newWords.array.join("|") + ")", "g");
                                for (var j = 0; j < $scope.subtitles.length; j++) {
                                    $scope.subtitles[j].text = $scope.subtitles[j].text.replace(rules, function (newWord) {
                                        return '<strong class="newWord">' + newWord + '</strong>';
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }])
;