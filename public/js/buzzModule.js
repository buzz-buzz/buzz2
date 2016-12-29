angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule'])
    .run(['$rootScope', 'tracking', 'queryParser', function ($rootScope, tracking, queryParser) {
        var query = queryParser.parse();

        tracking.send('play', {
            date: query.date,
            category: query.cat,
            level: query.level
        });
    }])
    .controller('VideoPlayerCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.queryString = location.search;
        $scope.$sce = $sce;
    }])
    .controller('LevelCtrl', ['$scope', 'queryParser', '$httpParamSerializer', function ($scope, queryParser, $httpParamSerializer) {
        var query = queryParser.parse();

        $scope.switchToLevel = function (level) {
            query.level = level;
            location.href = '/my/play?' + $httpParamSerializer(query);
        };

        $scope.switchToLevelFrom = function (currentLevel) {
            var to = currentLevel === 'A' ? 'B' : 'A';
            query.level = to;
            location.href = '/my/play?' + $httpParamSerializer(query);
        };

        $scope.currentLevel = query.level;
    }])
    .controller('page2ParentCtrl', ['$scope', 'tracking', function ($scope, tracking) {
        $scope.$root.tabularIndex = 1;

        $scope.$watch('tabularIndex', function (newVal, oldVal) {
            switch (newVal) {
                case 1:
                    tracking.send('play.vocabularyTab.click');
                    break;
                case 2:
                    tracking.send('play.exerciseTab.click');
                    break;
                case 3:
                    tracking.send('play.quizTab.click');
                    break;
                default:
                    break;
            }
        });
    }])
    .controller('quizCtrl', ['$scope', '$http', 'queryParser', '$sce', '$window', function ($scope, $http, queryParser, $sce, $window) {
        $window.onQuizDone = function (mark) {
            $scope.quizzes[$scope.quizIndex].status = mark;
        };
        var query = queryParser.parse();
        $scope.$sce = $sce;
        $scope.quizURL = "";

        var smilJson = '/resource/smil/' + query.date + '-' + query.level + '.json';
        $scope.quizzes = [];
        $scope.quizIndex = 0;
        var STATUS = $scope.STATUS = {
            "U": "unchecked",
            "P": "passed",
            "F": "failed"
        };
        $http.get(smilJson).then(function (result) {
            var smil = result.data;
            return smil.quizzes;
        }).then(function (ret) {
            if (ret && ret !== "") {
                return $http.get(ret);
            } else {
                return null;
            }
        }).then(function (ret) {
            var data = ret.data;
            var retArray = [];
            Object.keys(data).forEach(function (key) {
                retArray.push({
                    "name": key,
                    "url": data[key],
                    "status": STATUS.U
                });
            });
            $scope.quizzes = retArray;
            // $scope.quizURL = $scope.quizzes[$scope.quizIndex].url;
            if ($window.quizAdapter) {
                $window.quizAdapter.getResult("quiz", $scope.quizzes[$scope.quizIndex].url).then(function(ret) {
                    $window.onQuizDone($scope.STATUS.P);
                });
            }
            $scope.turnQuiz = function (isNext) {
                var maxIndex = $scope.quizzes.length - 1;
                if (isNext) {
                    $scope.quizIndex++;
                } else {
                    $scope.quizIndex--;
                }
                if ($scope.quizIndex > maxIndex) {
                    $scope.quizIndex = maxIndex;
                } else if ($scope.quizIndex < 0) {
                    $scope.quizIndex = 0;
                }
                // if ($scope.quizIndex===2) {
                //     $scope.quizzes[$scope.quizIndex].status=STATUS.P;
                // }
                // if ($scope.quizIndex===3) {
                //     $scope.quizzes[$scope.quizIndex].status=STATUS.F;
                // }
                if ($window.quizAdapter) {
                    $window.quizAdapter.getResult("quiz", $scope.quizzes[$scope.quizIndex].url).then(function(ret) {
                        $window.onQuizDone($scope.STATUS.P);
                    });
                }
            };
        });
    }])
    .controller('newWordCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', '$window', 'tracking', function ($scope, $http, queryParser, $timeout, $sce, $window, tracking) {
        $window.onWordDone = function (mark) {
            $scope.newWords[$scope.wordIndex].status = mark;
        };
        $scope.$sce = $sce;
        var query = queryParser.parse();
        var newWords = [];
        $scope.newWords = [];
        $scope.word = {};
        var wordIndex = $scope.wordIndex = 0;
        var smilJson = '/resource/smil/' + query.date + '-' + query.level + '.json';
        var STATUS = $scope.STATUS = {
            "U": "unchecked",
            "P": "passed",
            "F": "failed"
        };
        $http.get(smilJson).then(function (result) {
            var smil = result.data;
            return smil.newWords;
        }).then(function (ret) {
            if (ret && ret !== "") {
                return $http.get(ret);
            } else {
                return null;
            }
        }).then(function (ret) {
            if (!ret || !ret.data) {
                return null;
            }
            var wordsData = ret.data;
            if (wordsData.dictionary) {
                Object.keys(wordsData.dictionary).forEach(function (key) {
                    var thisWord = wordsData.dictionary[key];
                    newWords.push({
                        "word": key,
                        "id": thisWord.id,
                        "url": thisWord.url,
                        "exercise": thisWord.exercise || "",
                        "status": STATUS.U
                        // "exercise": thisWord.exercise || "http://content.bridgeplus.cn/buzz-quiz/" + query.date + '-' + query.level + "/index.html"
                    });
                });
                $scope.WORD_MAX_INDEX = newWords.length - 1;
                $scope.wordURL = newWords[wordIndex].url;
                if (newWords[wordIndex].exercise && newWords[wordIndex].exercise !== "") {
                    $scope.hasWordMode = true;
                    $scope.isWordMode = false;
                    $scope.wordURL = newWords[wordIndex].exercise;
                }
                $scope.newWords = newWords;
                // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
            }
        });
        $scope.turnWord = function (isNext) {
            if (isNext) {
                tracking.send('play.vocabularyTab.slideNextBtn.clicked');
            } else {
                tracking.send('play.vocabularyTab.slidePrevBtn.clicked');
            }

            var length = newWords.length;
            wordIndex = isNext ? ++wordIndex : --wordIndex;
            if (wordIndex >= length) {
                wordIndex = length - 1;
            } else if (wordIndex < 0) {
                wordIndex = 0;
            }
            $scope.wordIndex = wordIndex;
            $scope.wordURL = newWords[wordIndex].url;
            if (newWords[wordIndex].exercise && newWords[wordIndex].exercise !== "") {
                $scope.hasWordMode = true;
                $scope.isWordMode = false;
                $scope.wordURL = newWords[wordIndex].exercise;
            }
            // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
        };
        $scope.isWordMode = true;
        $scope.hasWordMode = false;
        $scope.changeWordMode = function (value) {
            $scope.isWordMode = value;
            if (value) {
                $scope.wordURL = newWords[wordIndex].url;
            } else {
                $scope.wordURL = newWords[wordIndex].exercise;
            }
        };
    }])
;
