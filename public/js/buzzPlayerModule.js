angular.module('buzzPlayerModule', ['angularQueryParserModule', 'trackingModule'])
    .run([function () {
        jwplayer.key = 'lG24bAGJCRLF1gi4kajg4EnUKi+ujyUyKMoSNA==';
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'queryParser', '$timeout', '$sce', 'tracking', function ($scope, $rootScope, $http, queryParser, $timeout, $sce, tracking) {
        $scope.$sce = $sce;
        var query = queryParser.parse();
        console.log(query);
        // var smilJson = '/resource/smil/' + query.date + '-' + query.level + '.json';
        // var smilJson = query.lessonInfoUrl.replace(':category', query.cat).replace(':level', query.level).replace(':date', query.date);
        var smilJson = query.video_path;
        console.log(smilJson);
        $http.get(smilJson).then(function (result) {
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

                    mainVideo.onTime(function (event) {
                        $scope.currentTime = convertSecondsToHHMMSS(event.position);
                        $scope.seconds = event.position;
                        $scope.$apply();
                    });

                    var videoInfo = {
                        date: query.date,
                        category: query.cat,
                        level: query.level
                    };

                    function extra() {
                        return {
                            seconds: $scope.seconds,
                            isFullScreen: $scope.fullScreen || false
                        };
                    }

                    function getData(event) {
                        return angular.extend({}, videoInfo, event, extra());
                    }

                    mainVideo.onPlay(function (event) {
                        tracking.send('play.video.playBtn.click', getData(event));
                    });

                    mainVideo.onPause(function (event) {
                        tracking.send('play.video.pauseBtn.click', getData(event))
                    });

                    mainVideo.onSeek(function (event) {
                        tracking.send('play.video.seekBtn', getData(event));
                    });

                    mainVideo.onFullscreen(function (event) {
                        $scope.fullScreen = event.fullscreen;
                        $scope.$apply();

                        tracking.send('play.video.fullScreenBtn.clicked', getData(event));
                    });

                    mainVideo.onQualityChange(function (event) {
                        tracking.send('play.video.definitionBtn', angular.extend({}, getData(event), {
                            toDefinition: event.levels[event.currentQuality].label
                        }));
                    });

                    mainVideo.onMute(function (event) {
                        tracking.send('play.video.muteBtn.click', getData(event));
                    });

                    mainVideo.onVolume(function (event) {
                        tracking.send('play.video.volumnBtn', getData(event));
                    });

                    function convertHHMMSSToSeconds(time) {
                        var parts = time.split(':');
                        var s = parts[parts.length - 1];
                        var m = parts[parts.length - 2];
                        var h = parts[parts.length - 3];

                        return Number(h) * 3600 + Number(m) * 60 + Number(s);
                    }

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

                    $scope.playTo = function (subtitle) {
                        var startSeconds = convertHHMMSSToSeconds(subtitle.startTime);

                        function seekAndPlay() {
                            console.log(mainVideo);
                            mainVideo.seek(startSeconds);
                            mainVideo.play(true);
                            tracking.send('play.speakerBtn.click', angular.extend({}, getData(), subtitle));
                        }

                        seekAndPlay();
                    };
                }).then(function () {
                    if (smil.newWords) {
                        $http.get(smil.newWords).then(function (result) {
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