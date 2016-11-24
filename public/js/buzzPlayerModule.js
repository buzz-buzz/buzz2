angular.module('buzzPlayerModule', ['angularQueryParserModule'])
    .run([function () {
        jwplayer.key = 'lG24bAGJCRLF1gi4kajg4EnUKi+ujyUyKMoSNA==';
    }])
    .controller('videoCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', function ($scope, $http, queryParser, $timeout, $sce) {
        $scope.$sce = $sce;
        var query = queryParser.parse();
        var smilJson = '/resource/smil/' + query.date + '-' + query.level + '.json';
        $http.get(smilJson).then(function (result) {
            var smil = result.data;

            var mainVideo = jwplayer('main-video').setup({
                height: document.querySelector('.video-wrapper').offsetHeight,
                playlist: [{
                    title: smil.title,
                    description: smil.description,
                    image: smil.image,
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
                        $scope.$apply();
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
                        mainVideo.seek(startSeconds);
                        mainVideo.play(true);
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