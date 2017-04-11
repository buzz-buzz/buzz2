'use strict';

function testDateRangeOfWeek(buzzCalendar, theDate, start, end) {
    expect(buzzCalendar.getFirstDateOfWeek(theDate)).toEqual(start);
    expect(buzzCalendar.getFirstDateOfNextWeek(theDate)).toEqual(end);
}
describe('date module', function () {
    let buzzCalendar;
    let calendar;

    beforeEach(angular.mock.module('DateModule'));
    beforeEach(inject(function (_BuzzCalendar_, _Calendar_) {
        buzzCalendar = _BuzzCalendar_;
        calendar = _Calendar_;
    }));

    it('get date of this monday', function () {
        let date = new Date(2017, 2, 31);
        expect(calendar.dateOffsetOfThisMonday(date)).toEqual(27);
    });

    it('get date of next monday', function () {
        let date = new Date(2017, 2, 31);
        expect(calendar.dateOffsetOfNextMonday(date)).toEqual(34);
    });

    it('get current week date range', function () {
        // jasmine.clock().mockDate(new Date(2017, 3, 11));
        testDateRangeOfWeek(buzzCalendar, new Date(2017, 3, 11), new Date(2017, 3, 10), new Date(2017, 3, 17));
        testDateRangeOfWeek(buzzCalendar, new Date(2017, 3, 30), new Date(2017, 3, 24), new Date(2017, 4, 1));
        testDateRangeOfWeek(buzzCalendar, new Date(2017, 2, 31), new Date(2017, 2, 27), new Date(2017, 3, 3));
    });

    it('get dates of this week', function () {
        let date = new Date(2017, 3, 11);

        expect(buzzCalendar.getDatesOfThisWeek(date)).toEqual([
            new Date(2017, 3, 10),
            new Date(2017, 3, 11),
            new Date(2017, 3, 12),
            new Date(2017, 3, 13),
            new Date(2017, 3, 14),
            new Date(2017, 3, 15),
            new Date(2017, 3, 16)
        ]);
    });
});
