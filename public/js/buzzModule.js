angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule'])
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
    .controller('page2ParentCtrl', ['$scope', function ($scope) {
        $scope.$root.tabularIndex = 1;
    }])
    .controller('quizCtrl', ['$scope', '$http', 'queryParser', '$sce', '$window', function ($scope, $http, queryParser, $sce, $window) {
        $window.onQuizDone = function(mark) {
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
            Object.keys(data).forEach(function(key) {
                retArray.push({
                    "name": key,
                    "url": data[key],
                    "status": STATUS.U
                });
            });
            $scope.quizzes = retArray;
            $scope.quizURL = $scope.quizzes[$scope.quizIndex].url;
            $scope.turnQuiz = function(isNext) {
                var maxIndex = $scope.quizzes.length - 1;
                if (isNext) {
                    $scope.quizIndex ++;
                } else {
                    $scope.quizIndex --;
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
                $scope.quizURL = $scope.quizzes[$scope.quizIndex].url;
            };
        });
    }])
    .controller('newWordCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', function ($scope, $http, queryParser, $timeout, $sce) {
        $scope.$sce = $sce;
        var query = queryParser.parse();
        var newWords = [];
        $scope.word = {};
        var wordIndex = $scope.wordIndex = 0;
        var smilJson = '/resource/smil/' + query.date + '-' + query.level + '.json';
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
                        "exercise": thisWord.exercise || ""
                        // "exercise": thisWord.exercise || "http://content.bridgeplus.cn/buzz-quiz/" + query.date + '-' + query.level + "/index.html"
                    });
                });
                $scope.WORD_MAX_INDEX = newWords.length - 1;
                $scope.wordURL = newWords[wordIndex].url;
                if (newWords[wordIndex].exercise && newWords[wordIndex].exercise !=="") {
                    $scope.hasWordMode = true;
                    $scope.isWordMode = false;
                    $scope.wordURL = newWords[wordIndex].exercise;
                }
                // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
            }
        });
        $scope.turnWord = function (isNext) {
            var length = newWords.length;
            wordIndex = isNext ? ++wordIndex : --wordIndex;
            if (wordIndex >= length) {
                wordIndex = length - 1;
            } else if (wordIndex < 0) {
                wordIndex = 0;
            }
            $scope.wordIndex = wordIndex;
            $scope.wordURL = newWords[wordIndex].url;
            if (newWords[wordIndex].exercise && newWords[wordIndex].exercise !=="") {
                $scope.hasWordMode = true;
                $scope.isWordMode = false;
                $scope.wordURL = newWords[wordIndex].exercise;
            }
            // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
        };
        $scope.isWordMode = true;
        $scope.hasWordMode = false;
        $scope.changeWordMode = function(value) {
            $scope.isWordMode = value;
            if (value) {
                $scope.wordURL = newWords[wordIndex].url;
            } else {
                $scope.wordURL = newWords[wordIndex].exercise;
            }
        };
    }])
;
