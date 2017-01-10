angular.module('buzzHeaderModule')
    .controller('LevelCtrl', ['$scope', 'queryParser', '$httpParamSerializer', function ($scope, queryParser, $httpParamSerializer) {
        var query = queryParser.parse();

        $scope.switchToLevelFrom = function (currentLevel) {
            var to = currentLevel === 'A' ? 'B' : 'A';
            query.level = to;
            location.href = location.pathname + '?' + $httpParamSerializer(query);
        };

        $scope.currentLevel = query.level || 'B';
    }])