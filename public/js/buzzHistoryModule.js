angular.module('buzzHistoryModule', [])
    .controller('historyCtrl', ['$scope', function ($scope) {
        $scope.historyLessions = new Array(10);
        $scope.historyLessions.fill({});
    }])
;