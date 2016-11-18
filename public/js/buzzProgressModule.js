angular.module('buzzProgressModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule'])
    .controller('calendarCtrl', ['$scope', function ($scope) {
        $scope.today = new Date();
        $scope.current = new Date();
        $scope.performances = [
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null]
        ];

        dateChanged();

        $scope.gotoMonth = function (diff) {
            $scope.current.setMonth($scope.current.getMonth() + diff);
            dateChanged();
        };

        function dateChanged() {
            var days = new Date($scope.current.getFullYear(), $scope.current.getMonth() + 1, 0).getDate();
            var theFirstDayOfCurrentMonth = new Date($scope.current.getFullYear(), $scope.current.getMonth(), 1).getDay();
            console.log(theFirstDayOfCurrentMonth);
            $scope.weekDays = [
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null]
            ];
            var day = 1;
            for (var i = 0; i < $scope.weekDays.length; i++) {
                var start = 0;

                if (i === 0) {
                    start = theFirstDayOfCurrentMonth;
                }

                for (var j = start; j < $scope.weekDays[i].length && day <= days; j++) {

                    $scope.weekDays[i][j] = new Date($scope.current.getFullYear(), $scope.current.getMonth(), day++, 0, 0, 0);
                }
            }

            getPerformances();
        }

        function getPerformance(date) {
            console.log('today = ', $scope.today, '; date = ', date);
            if (!date || date >= $scope.today) {
                console.log('not valid');
                return '';
            }

            var a = ['good', 'bad', 'none'];

            let result = a[Math.round(Math.random() * 2)];
            console.log('result = ', result);
            return result;
        }


        function getPerformances() {
            for (var i = 0; i < $scope.weekDays.length; i++) {
                for (var j = 0; j < $scope.weekDays[i].length; j++) {
                    $scope.performances[i][j] = getPerformance($scope.weekDays[i][j]);
                }
            }
        }
    }])
    .controller('topCtrl', ['$scope', function ($scope) {

    }])
;