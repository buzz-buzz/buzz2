angular.module('exerciseModule', [])
    .controller('exerciseCtrl', ['$scope', '$sce', function ($scope, $sce) {
        // $scope.
        $scope.questions = [
            {
                isCorrect: false
            },
            {
                isCorrect: false
            },
            {
                isCorrect: false
            },
            {
                isCorrect: false
            },
            {
                isCorrect: false
            }
        ];
        $scope.selectedIndex = 3;
        $scope.checked = false;
        $scope.next = function() {
            $scope.questions.forEach(function(ret) {
                ret.isCorrect = Math.random() > 0.5 ? true: false;
            });
            $scope.checked = true;
        };
    }]);