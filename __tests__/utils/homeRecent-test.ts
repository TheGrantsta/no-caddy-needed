import { buildRecentItems } from '../../utils/homeRecent';

const now = new Date(2026, 10, 9, 15, 0); // Mon 9 Nov 2026, local time
const at = (day: number, hour = 10) => new Date(2026, 10, day, hour).toISOString();

const round = (overrides: object = {}) => ({
    Id: 1,
    CourseName: 'Stats Flow Test Course',
    HolesPlayed: 9,
    StartTime: at(9),
    IsCompleted: 1,
    ...overrides,
});

const drill = (overrides: object = {}) => ({
    Id: 1,
    Name: 'Short-Putting Ladder',
    Score: 15,
    Timestamp: at(9, 12),
    ...overrides,
});

describe('buildRecentItems', () => {
    it('shouldDescribeARoundWithCourseHolesAndDay', () => {
        const [item] = buildRecentItems([round()], [], now);

        expect(item).toEqual(expect.objectContaining({
            title: 'Stats Flow Test Course',
            subtitle: 'Round · 9 holes · Today',
            icon: 'flag',
            href: '/perform',
        }));
    });

    it('shouldUseSingularHoleForARoundOfOne', () => {
        const [item] = buildRecentItems([round({ HolesPlayed: 1 })], [], now);

        expect(item.subtitle).toBe('Round · 1 hole · Today');
    });

    it('shouldUseAGenericCourseNameWhenTheRoundHasNone', () => {
        const [item] = buildRecentItems([round({ CourseName: null })], [], now);

        expect(item.title).toBe('Round');
    });

    it('shouldDescribeAPracticeDrillWithItsNameScoreAndDay', () => {
        const [item] = buildRecentItems([], [drill()], now);

        expect(item).toEqual(expect.objectContaining({
            title: 'Short-putting ladder',
            subtitle: 'Practice · Score 15 · Today',
            icon: 'stairs',
            href: '/practice',
        }));
    });

    it('shouldLeaveOutTheScoreWhenADrillHasNone', () => {
        const [item] = buildRecentItems([], [drill({ Score: null })], now);

        expect(item.subtitle).toBe('Practice · Today');
    });

    it('shouldShowTheTwoMostRecentItemsAcrossRoundsAndDrillsNewestFirst', () => {
        const items = buildRecentItems(
            [round({ CourseName: 'Old course', StartTime: at(2) }), round({ CourseName: 'New course', StartTime: at(8) })],
            [drill({ Name: 'Lag Putting', Score: 4, Timestamp: at(9, 12) })],
            now
        );

        expect(items.map(i => i.title)).toEqual(['Lag putting', 'New course']);
    });

    it('shouldReturnNothingWhenThereIsNoHistory', () => {
        expect(buildRecentItems([], [], now)).toEqual([]);
    });

    it('shouldSkipRoundsWithAnUnreadableStartTime', () => {
        expect(buildRecentItems([round({ StartTime: 'garbage' })], [], now)).toEqual([]);
    });
});
