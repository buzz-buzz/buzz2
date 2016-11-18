angular.module('buzzProgressModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule'])
    .controller('calendarCtrl', ['$scope', function ($scope) {
        $scope.current = new Date();

        $scope.gotoMonth = function (diff) {
            $scope.current.setMonth($scope.current.getMonth() + diff);
            dateChanged();
        };

        var WeekDaySequence = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6
        };

        function dateChanged() {
            $scope.days = new Date($scope.current.getFullYear(), $scope.current.getMonth() + 1, 0).getDate();
            var theFirstDayOfCurrentMonth = new Date($scope.current.getFullYear(), $scope.current.getMonth(), 1).getDay();
            console.log(theFirstDayOfCurrentMonth);
            $scope.weekDays = [[], [], [], [], []];
            var day = 1;
            for (var i = 0; i < $scope.weekDays.length; i++) {
                var start = 0;

                if (i === 0) {
                    start = theFirstDayOfCurrentMonth;
                }

                for (var j = start; j < $scope.weekDays[i].length; j++) {
                    $scope.weekDays[i][j] = day++;
                }
            }
        }
    }])
    .controller('topCtrl', ['$scope', function ($scope) {

    }])
;