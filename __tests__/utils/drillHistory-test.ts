import { describeDrill, formatDrillDate, groupDrillsByWeek, parseDrillDate } from '../../utils/drillHistory';

// SQLite's CURRENT_TIMESTAMP stores UTC as 'YYYY-MM-DD HH:MM:SS' (no T, no Z)
const sqliteUtc = (date: Date) => date.toISOString().replace('T', ' ').slice(0, 19);

const now = new Date(2026, 10, 9, 15, 0); // Mon 9 Nov 2026, local time

describe('describeDrill', () => {
    it('shouldGiveEachSavedChallengeItsScreenNameAndIcon', () => {
        expect(describeDrill('Putting Simulation')).toEqual({ label: 'Putting sim', icon: 'adjust' });
        expect(describeDrill('Up-and-down Challenge')).toEqual({ label: 'Up-and-down', icon: 'flag' });
        expect(describeDrill('Short-Putting Ladder')).toEqual({ label: 'Short-putting ladder', icon: 'stairs' });
        expect(describeDrill('Lag Putting')).toEqual({ label: 'Lag putting', icon: 'trending-up' });
    });

    it('shouldFallBackToTheSavedNameAndAGenericIconForUnknownChallenges', () => {
        expect(describeDrill('Chipping')).toEqual({ label: 'Chipping', icon: 'sports-golf' });
    });
});

describe('parseDrillDate', () => {
    it('shouldParseIsoTimestamps', () => {
        const date = new Date(2026, 10, 9, 8, 30);

        expect(parseDrillDate(date.toISOString())?.getTime()).toBe(date.getTime());
    });

    it('shouldParseSqliteUtcTimestampsWithASpaceSeparator', () => {
        const date = new Date(2026, 10, 9, 8, 30);

        expect(parseDrillDate(sqliteUtc(date))?.getTime()).toBe(date.getTime());
    });

    it('shouldReturnNullForAValueThatIsNotADate', () => {
        expect(parseDrillDate('not a date')).toBeNull();
        expect(parseDrillDate('')).toBeNull();
    });
});

describe('formatDrillDate', () => {
    it('shouldShowTodayForASqliteTimestampFromToday', () => {
        expect(formatDrillDate(sqliteUtc(new Date(2026, 10, 9, 8, 30)), now)).toBe('Today');
    });

    it('shouldShowADashInsteadOfInvalidDateForAValueThatCannotBeParsed', () => {
        expect(formatDrillDate('garbage', now)).toBe('—');
    });

    it('shouldShowTodayForADrillFromTheSameDay', () => {
        expect(formatDrillDate(new Date(2026, 10, 9, 8, 30).toISOString(), now)).toBe('Today');
    });

    it('shouldShowTheWeekdayDayAndMonthForEarlierDays', () => {
        expect(formatDrillDate(new Date(2026, 10, 7, 10, 0).toISOString(), now)).toBe('Sat 7 Nov');
    });
});

describe('groupDrillsByWeek', () => {
    const drill = (name: string, date: Date) => ({ Name: name, Created_At: date.toISOString() });

    it('shouldPutDrillsFromTheLastSevenDaysUnderThisWeek', () => {
        const drills = [drill('Lag Putting', new Date(2026, 10, 7, 10))];

        const { thisWeek, previously } = groupDrillsByWeek(drills, now);

        expect(thisWeek).toEqual(drills);
        expect(previously).toEqual([]);
    });

    it('shouldPutASqliteTimestampFromThisWeekUnderThisWeek', () => {
        const drills = [{ Name: 'Short-Putting Ladder', Created_At: sqliteUtc(new Date(2026, 10, 9, 8, 30)) }];

        expect(groupDrillsByWeek(drills, now).thisWeek).toEqual(drills);
    });

    it('shouldIncludeTheDayExactlySixDaysAgoInThisWeek', () => {
        const drills = [drill('Lag Putting', new Date(2026, 10, 3, 9))];

        expect(groupDrillsByWeek(drills, now).thisWeek).toEqual(drills);
    });

    it('shouldPutOlderDrillsUnderPreviously', () => {
        const drills = [drill('Up-and-down Challenge', new Date(2026, 10, 1, 9))];

        const { thisWeek, previously } = groupDrillsByWeek(drills, now);

        expect(thisWeek).toEqual([]);
        expect(previously).toEqual(drills);
    });

    it('shouldKeepTheOrderTheDrillsWereGivenWithinEachGroup', () => {
        const first = drill('Lag Putting', new Date(2026, 10, 8, 9));
        const second = drill('Putting Simulation', new Date(2026, 10, 5, 9));

        expect(groupDrillsByWeek([first, second], now).thisWeek).toEqual([first, second]);
    });

    it('shouldReturnTwoEmptyGroupsWhenThereAreNoDrills', () => {
        expect(groupDrillsByWeek([], now)).toEqual({ thisWeek: [], previously: [] });
    });
});
