angular.module('exerciseModule', [])
    .controller('exerciseCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.queryString = location.search;
        $scope.$sce = $sce;
    }]);