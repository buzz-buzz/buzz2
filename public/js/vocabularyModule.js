angular.module('vocabularyModule', [])
    .controller('vocabularyCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.printMode = false;
        $scope.printURL = "";
        var RADIO_TYPE = $scope.RADIO_TYPE = {
            "NONE": "none",
            "PASS": "pass",
            "FAIL": "fail",
            "NOTTEST": "nottest"
        };
        $scope.radioBoxType = RADIO_TYPE.NONE;
        $scope.$sce = $sce;
        var PRINT_URL_PREFIX = "/vocabulary/print?";
        $scope.vocabularyPrint = function() {
            $scope.printMode = true;
            $scope.printURL = PRINT_URL_PREFIX;
        };
        $scope.hidePopup = function() {
            $scope.printMode = false;
            $scope.printURL = "";
        };
        $scope.checkboxClick = function(type) {
            if (type === $scope.radioBoxType) {
                $scope.radioBoxType = RADIO_TYPE.NONE;
            } else {
                $scope.radioBoxType = type;
            }
        };
    }]);