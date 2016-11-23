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
    }])
    .controller('page2ParentCtrl', ['$scope', function ($scope) {
        $scope.tabularIndex = 1;
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
                        "url": thisWord.url
                    });
                });
                $scope.WORD_MAX_INDEX = newWords.length - 1;
                $scope.wordURL = newWords[wordIndex].url;
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
            // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
        };
    }])
;