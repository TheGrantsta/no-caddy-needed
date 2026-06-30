import { findClubSuggestions, ClubSuggestion } from '../../service/ClubSuggestionService';
import { WedgeChartData } from '../../service/DbService';

describe('findClubSuggestions', () => {
    const mockWedgeChartData: WedgeChartData = {
        distanceNames: ['half', '3/4', 'full'],
        clubs: [
            {
                club: '52°',
                distances: [
                    { name: 'half', distance: 80 },
                    { name: '3/4', distance: 105 },
                    { name: 'full', distance: 130 },
                ],
            },
            {
                club: '56°',
                distances: [
                    { name: 'half', distance: 70 },
                    { name: '3/4', distance: 95 },
                    { name: 'full', distance: 120 },
                ],
            },
            {
                club: '60°',
                distances: [
                    { name: 'half', distance: 60 },
                    { name: '3/4', distance: 85 },
                    { name: 'full', distance: 110 },
                ],
            },
        ],
    };

    describe('exact match', () => {
        it('returns single club when yardage exactly matches a distance', () => {
            const result = findClubSuggestions(130, mockWedgeChartData);

            expect(result).toHaveLength(1);
            expect(result[0].club).toBe('52°');
            expect(result[0].distance).toBe(130);
            expect(result[0].matchType).toBe('exact');
        });

        it('matches the closest distance within tolerance for a club', () => {
            const result = findClubSuggestions(131, mockWedgeChartData);

            expect(result).toHaveLength(1);
            expect(result[0].club).toBe('52°');
            expect(result[0].matchType).toBe('exact');
        });
    });

    describe('between two clubs', () => {
        it('returns both clubs when yardage falls between them', () => {
            const result = findClubSuggestions(125, mockWedgeChartData);

            expect(result).toHaveLength(2);
            expect(result[0].club).toBe('52°');
            expect(result[0].distance).toBe(130);
            expect(result[1].club).toBe('56°');
            expect(result[1].distance).toBe(120);
            expect(result[0].matchType).toBe('between');
            expect(result[1].matchType).toBe('between');
        });

        it('handles yardage between different distance types', () => {
            const result = findClubSuggestions(115, mockWedgeChartData);

            expect(result).toHaveLength(2);
            expect(result[0].club).toBe('56°');
            expect(result[1].club).toBe('60°');
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

    describe('tolerance', () => {
        it('considers yardages within 3 yards as exact match', () => {
            const result = findClubSuggestions(133, mockWedgeChartData);

            expect(result).toHaveLength(1);
            expect(result[0].club).toBe('52°');
            expect(result[0].matchType).toBe('exact');
        });

        it('considers yardages outside 3 yard tolerance as between', () => {
            const result = findClubSuggestions(126, mockWedgeChartData);

            expect(result).toHaveLength(2);
            expect(result[0].matchType).toBe('between');
        });
    });
});
