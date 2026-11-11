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

describe('buildRecentItems', () => {
    it('shouldDescribeARoundWithCourseHolesAndDay', () => {
        const [item] = buildRecentItems([round()], now);

        expect(item).toEqual(expect.objectContaining({
            title: 'Stats Flow Test Course',
            subtitle: '9 holes · Today',
            icon: 'flag',
            href: '/perform',
            roundId: 1,
        }));
    });

    it('shouldUseSingularHoleForARoundOfOne', () => {
        const [item] = buildRecentItems([round({ HolesPlayed: 1 })], now);

        expect(item.subtitle).toBe('1 hole · Today');
    });

    it('shouldUseAGenericCourseNameWhenTheRoundHasNone', () => {
        const [item] = buildRecentItems([round({ CourseName: null })], now);

        expect(item.title).toBe('Round');
    });

    it('shouldListOnlyRoundsAndNeverPracticeActivity', () => {
        const items = buildRecentItems([round({ CourseName: 'Only course' })], now);

        expect(items).toHaveLength(1);
        expect(items.every(item => item.icon === 'flag')).toBe(true);
    });

    it('shouldShowTheThreeMostRecentRoundsNewestFirst', () => {
        const items = buildRecentItems(
            [
                round({ Id: 1, CourseName: 'Oldest course', StartTime: at(1) }),
                round({ Id: 2, CourseName: 'Old course', StartTime: at(2) }),
                round({ Id: 3, CourseName: 'New course', StartTime: at(8) }),
                round({ Id: 4, CourseName: 'Newest course', StartTime: at(9) }),
            ],
            now
        );

        expect(items.map(i => i.title)).toEqual(['Newest course', 'New course', 'Old course']);
    });

    it('shouldReturnNothingWhenThereAreNoRounds', () => {
        expect(buildRecentItems([], now)).toEqual([]);
    });

    it('shouldSkipRoundsWithAnUnreadableStartTime', () => {
        expect(buildRecentItems([round({ StartTime: 'garbage' })], now)).toEqual([]);
    });
});
