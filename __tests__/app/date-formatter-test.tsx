import { getTwoDigitDayAndMonth } from '../../app/DateFormatter';

describe('Date formatter', () => {
    it('return two digit day and month with "/" delimitator', () => {
        expect(getTwoDigitDayAndMonth('2024-09-07T15:42:01.234Z')).toBe('07/09');
        expect(getTwoDigitDayAndMonth('2024-12-11T15:42:01.234Z')).toBe('11/12');
        expect(getTwoDigitDayAndMonth('2024-10-19T15:42:01.234Z')).toBe('19/10');
    });
});