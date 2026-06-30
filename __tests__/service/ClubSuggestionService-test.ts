import { findClubSuggestions, ClubSuggestion } from '../../service/ClubSuggestionService';
import { WedgeChartData } from '../../service/DbService';

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
