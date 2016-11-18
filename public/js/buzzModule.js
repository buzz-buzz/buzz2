angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .run(['$rootScope', 'service', 'clientConfig', function ($rootScope, service, clientConfig) {
        service.get(clientConfig.serviceUrls.sso.profile.load.frontEnd).then(function (result) {
            $rootScope.profile = result;
        });
    }])
    .controller('headerCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $rootScope.$watch('profile', function (newValue, oldValue) {
            $scope.profile = newValue;
        });
    }])
    .controller('VideoPlayerCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.queryString = location.search;
        $scope.$sce = $sce;
    }])
    .controller('newWordCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', function ($scope, $http, queryParser, $timeout, $sce) {
        $scope.$sce = $sce;
        var query = queryParser.parse();
        var newWords = [];
        $scope.word = {};
        var wordIndex = 0;
        var smilJson = '/resource/smil/' + query.date + '-' + query.level + '.json';
        $http.get(smilJson).then(function (result) {
            var smil = result.data;
            return smil.newWords;
        }).then(function(ret) {
            if (ret && ret !== "") {
                return $http.get(ret);
            } else {
                return null;
            }
        }).then(function(ret) {
            if (!ret || !ret.data) {
                return null;
            }
            var wordsData = ret.data;
            if (wordsData.dictionary) {
                Object.keys(wordsData.dictionary).forEach(function(key) {
                    var thisWord = wordsData.dictionary[key];
                    newWords.push({
                        "word": key,
                        "id": thisWord.id,
                        "url": thisWord.url
                    });
                });
                $scope.wordURL = newWords[wordIndex].url;
                // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
            }
        });
        $scope.turnWord = function(isNext) {
            var length = newWords.length;
            wordIndex = isNext ? ++wordIndex : --wordIndex;
            if (wordIndex >= length) {
                wordIndex = 0;
            } else if (wordIndex < 0) {
                wordIndex = length - 1;
            }
            $scope.wordURL = newWords[wordIndex].url;
            // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
        };
    }])
;