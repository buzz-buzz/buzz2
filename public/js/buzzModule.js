angular.module('buzzModule', [])
    .controller('videoCtrl', ['$scope', '$interval', '$http', '$sce', function ($scope, $interval, $http, $sce) {
        $scope.tabularIndex = 1;
        let searchStr = location.search.substr(1);
        let queryAry = searchStr.split("&");
        let queryObj = {};
        queryAry.forEach(function (val) {
            var valAry = val.split("=");
            queryObj[valAry[0]] = valAry[1];
        });
        var urlhead = `http://buzz-course-video.b0.upaiyun.com/news/${queryObj.cat}/${queryObj.date}-${queryObj.level}`;

        $scope.definition = '1080w';

        $scope.$watch('definition', function (newValue, oldValue) {
            var videoUrl = urlhead + "-" + $scope.definition + ".mp4";
            $scope.src = $sce.trustAsResourceUrl(videoUrl);

            jwplayer('main-video').setup({
                file: $scope.src
            });
        });

        $http.get(urlhead + ".ass").then(function (ret) {
            let data = ret.data;
            let dataArray = data.split("Dialogue:");
            dataArray.shift();
            $scope.subtitles = [];
            const standard = Date.UTC(1, 1, 1, 0);
            let toSecond = function (time) {
                var timeAry = time.split(":");
                return (Date.UTC(1, 1, 1, timeAry[0], timeAry[1], timeAry[2].split(".")[0]) - standard) / 1000;
            };
            var obj = {};
            var endTime = "";
            dataArray.forEach(function (target) {
                var targetAry = target.split(",");
                var thisEndTime = toSecond(targetAry[2]).toString();
                if (endTime !== thisEndTime) {
                    endTime = thisEndTime;
                    obj = {};
                    $scope.subtitles.push(obj);
                }
                var tmpText = targetAry.slice(9).join(",");
                var targetText = tmpText.split('\n')[0];
                var textArray = targetText.split("{");
                var displayTextArray = [];
                if (textArray.length === 1) {
                    displayTextArray.push({
                        val: textArray[0],
                        newWord: false
                    });
                } else {
                    textArray.forEach(function (textVal) {
                        if (textVal !== "") {
                            var bb = textVal.split("}");
                            if (bb.length === 1) {
                                displayTextArray.push({
                                    val: bb[0],
                                    newWord: false
                                });
                            } else {
                                displayTextArray.push({
                                    val: bb[0],
                                    newWord: true
                                });
                            }
                            if (bb[1] && bb[1] !== "") {
                                displayTextArray.push({
                                    val: bb[1],
                                    newWord: false
                                });
                            }
                        }
                    })
                }
                obj[toSecond(targetAry[1]).toString()] = {
                    endTime: thisEndTime,
                    textArray: displayTextArray
                };
            });
        });
        // var mainVideo = document.getElementById('main-video');
        angular.element(document).ready(function () {
            var mainVideo = jwplayer('main-video');

            $scope.currentTime = Math.round(mainVideo.getPosition());
            var intervalPromise = null;

            mainVideo.on('pause', function (event) {
                console.log('pause');
                $interval.cancel(intervalPromise);
            });

            mainVideo.on('play', function () {
                console.log('play');
                intervalPromise = $interval(function () {
                    $scope.currentTime = Math.round(mainVideo.getPosition());
                    console.log($scope.currentTime);
                }, 500);
            });

            $scope.playTo = function (time) {
                // mainVideo.currentTime = time;
                mainVideo.seek(time);
                mainVideo.play(true);
            };
        });

        $scope.today = new Date();
    }]);