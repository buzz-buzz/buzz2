angular.module('DateModule', ['angularQueryParserModule'])
    .value('Month', {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
    })
    .factory('DateOfMonth', [function () {
        return {
            getShortString: function (dateIndex) {
                if (dateIndex == 1) {
                    return '1st';
                }

                if (dateIndex == 2) {
                    return '2nd';
                }

                return dateIndex + 'th';
            }
        };
    }])
    .factory('DateFactory', ['queryParser', function (queryParser) {
        return {
            getCurrentDate: function () {
                var query = queryParser.parse();
                if (!query || !query.current) {
                    return new Date();
                }

                try {
                    return new Date(query.current);
                } catch (ex) {
                    return new Date();
                }
            },
            getFirstDayOfMonth: function (date) {
                return new Date(date.getFullYear(), date.getMonth(), 1);
            },
            getFirstDayOfNextMonth: function (date) {
                return new Date(date.getFullYear(), date.getMonth() + 1, 1);
            },
            getFirstDayOfWeek: function (date) {
                return new Date(date.getFullYear(), date.getMonth(), Math.min(date.getDate() - date.getDay(), 1));
            },
            getFirstDayOfNextWeek: function (date) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7 - date.getDay());
            },
            toDateISOString: function (date) {
                return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            },
            getWeekNumberOfMonth: function (date) {
                return Math.floor((date.getDate() + this.getFirstDayOfMonth(date).getDay() - 1) / 7) + 1;
            }
        };
    }])
    .factory('Calendar', [function () {
        function getOffsetToMonday(date) {
            return (date.getDay() + 6) % 7;
        }

        function dateOffsetOfThisMonday(date) {
            return date.getDate() - getOffsetToMonday(date);
        }

        function dateOffsetOfNextMonday(date) {
            return date.getDate() - getOffsetToMonday(date) + 7;
        }

        return {
            dateOffsetOfThisMonday: dateOffsetOfThisMonday,
            dateOffsetOfNextMonday: dateOffsetOfNextMonday
        };
    }])
    .factory('BuzzCalendar', ['Calendar', function (Calendar) {
        return {
            getFirstDateOfWeek: function (date) {
                return new Date(date.getFullYear(), date.getMonth(), Calendar.dateOffsetOfThisMonday(date));
            },
            getFirstDateOfNextWeek: function (date) {
                return new Date(date.getFullYear(), date.getMonth(), Calendar.dateOffsetOfNextMonday(date));
            },
            getDatesOfThisWeek: function (date) {
                var dates = [];
                var first = this.getFirstDateOfWeek(date);
                for (var i = 0; i < 7; i++) {
                    dates.push(new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));
                }

                return dates;
            }
        };
    }])
;