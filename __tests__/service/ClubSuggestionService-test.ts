import { findClubSuggestions, ClubSuggestion, findNearestClubDistance, ClubDistanceSuggestion } from '../../service/ClubSuggestionService';
import { WedgeChartData, ClubDistance } from '../../service/DbService';

describe('findClubSuggestions', () => {
    const mockWedgeChartData: WedgeChartData = {
        distanceNames: ['half', '3/4', 'full'],
        clubs: [
            {
                club: '52°',
                distances: [
                    { name: 'half', distance: 102 },
                    { name: '3/4', distance: 115 },
                    { name: 'full', distance: 130 },
                ],
            },
            {
                club: '56°',
                distances: [
                    { name: 'half', distance: 98 },
                    { name: '3/4', distance: 109 },
                    { name: 'full', distance: 125 },
                ],
            },
            {
                club: '60°',
                distances: [
                    { name: 'half', distance: 60 },
                    { name: '3/4', distance: 92 },
                    { name: 'full', distance: 110 },
                ],
            },
        ],
    };

    describe('find clubs that could be used', () => {
        it('returns one club suggestion when yardage plus 5 yards of roll matches a distance', () => {
            const result = findClubSuggestions(138, mockWedgeChartData);

            expect(result).toHaveLength(1);
            expect(result[0].club).toBe('52°');
            expect(result[0].name).toBe('full');
            expect(result[0].distance).toBe(130);
        });

        it('returns multiple club suggestions when yardage plus 5 yards of roll falls between two distances', () => {
            const result = findClubSuggestions(99, mockWedgeChartData);

            expect(result).toHaveLength(2);
            expect(result[0].club).toBe('56°');
            expect(result[0].name).toBe('half');
            expect(result[0].distance).toBe(98);
            expect(result[1].club).toBe('60°');
            expect(result[1].name).toBe('3/4');
            expect(result[1].distance).toBe(92);
        });
    });

    describe('no match', () => {
        it('returns empty array when yardage is far outside range', () => {
            const result = findClubSuggestions(200, mockWedgeChartData);

            expect(result).toHaveLength(0);
        });

        it('returns empty array when yardage is below all distances', () => {
            const result = findClubSuggestions(40, mockWedgeChartData);

            expect(result).toHaveLength(0);
        });
    });

    describe('edge cases', () => {
        it('returns empty array when wedge chart is empty', () => {
            const emptyChart: WedgeChartData = { distanceNames: [], clubs: [] };
            const result = findClubSuggestions(100, emptyChart);

            expect(result).toHaveLength(0);
        });

        it('returns empty array when clubs have no distances', () => {
            const chartWithoutDistances: WedgeChartData = {
                distanceNames: ['full'],
                clubs: [{ club: '52°', distances: [] }],
            };
            const result = findClubSuggestions(100, chartWithoutDistances);

            expect(result).toHaveLength(0);
        });

        it('handles single club in chart', () => {
            const singleClubChart: WedgeChartData = {
                distanceNames: ['full'],
                clubs: [
                    {
                        club: '52°',
                        distances: [{ name: 'full', distance: 130 }],
                    },
                ],
            };
            const result = findClubSuggestions(130, singleClubChart);

            expect(result).toHaveLength(1);
            expect(result[0].club).toBe('52°');
        });

        it('handles zero yardage', () => {
            const result = findClubSuggestions(0, mockWedgeChartData);

            expect(result).toHaveLength(0);
        });

        it('handles negative yardage', () => {
            const result = findClubSuggestions(-50, mockWedgeChartData);

            expect(result).toHaveLength(0);
        });
    });
});

describe('findNearestClubDistance', () => {
    const mockClubDistances: ClubDistance[] = [
        { Id: 1, Club: 'Driver', CarryDistance: 230, TotalDistance: undefined as any, SortOrder: undefined as any },
        { Id: 2, Club: '7 Iron', CarryDistance: 150, TotalDistance: undefined as any, SortOrder: undefined as any },
        { Id: 3, Club: 'PW', CarryDistance: 110, TotalDistance: undefined as any, SortOrder: undefined as any },
    ];

    describe('nearest match', () => {
        it('returns the nearest club when target is between two clubs', () => {
            const result = findNearestClubDistance(135, mockClubDistances);

            expect(result).not.toBeNull();
            expect(result?.club).toBe('7 Iron');
            expect(result?.distance).toBe(150);
        });

        it('returns the first club on exact tie (first-in-array wins)', () => {
            const tiedDistances: ClubDistance[] = [
                { Id: 1, Club: '7 Iron', CarryDistance: 150, TotalDistance: undefined as any, SortOrder: undefined as any },
                { Id: 2, Club: 'PW', CarryDistance: 110, TotalDistance: undefined as any, SortOrder: undefined as any },
            ];
            const result = findNearestClubDistance(130, tiedDistances);

            expect(result).not.toBeNull();
            expect(result?.club).toBe('7 Iron');
        });

        it('returns the nearest club when target is below shortest club', () => {
            const result = findNearestClubDistance(50, mockClubDistances);

            expect(result).not.toBeNull();
            expect(result?.club).toBe('PW');
            expect(result?.distance).toBe(110);
        });

        it('returns the nearest club when target is above longest club', () => {
            const result = findNearestClubDistance(300, mockClubDistances);

            expect(result).not.toBeNull();
            expect(result?.club).toBe('Driver');
            expect(result?.distance).toBe(230);
        });

        it('returns exact match when target equals a club distance', () => {
            const result = findNearestClubDistance(150, mockClubDistances);

            expect(result).not.toBeNull();
            expect(result?.club).toBe('7 Iron');
            expect(result?.distance).toBe(150);
        });
    });

    describe('no match', () => {
        it('returns null when clubDistances array is empty', () => {
            const result = findNearestClubDistance(100, []);

            expect(result).toBeNull();
        });

        it('returns null when clubDistances is null', () => {
            const result = findNearestClubDistance(100, null as any);

            expect(result).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('returns the single club when list has only one club', () => {
            const singleClub: ClubDistance[] = [
                { Id: 1, Club: '7 Iron', CarryDistance: 150, TotalDistance: undefined as any, SortOrder: undefined as any },
            ];
            const result = findNearestClubDistance(200, singleClub);

            expect(result).not.toBeNull();
            expect(result?.club).toBe('7 Iron');
        });

        it('returns null when adjustedYards is zero', () => {
            const result = findNearestClubDistance(0, mockClubDistances);

            expect(result).toBeNull();
        });

        it('returns null when adjustedYards is negative', () => {
            const result = findNearestClubDistance(-50, mockClubDistances);

            expect(result).toBeNull();
        });
    });
});
