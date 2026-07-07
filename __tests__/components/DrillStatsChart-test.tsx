import React from 'react';
import { render } from '@testing-library/react-native';
import DrillStatsChart from '../../components/DrillStatsChart';
import { DrillStats } from '@/service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('DrillStatsChart component', () => {
    const mockStats: DrillStats[] = [
        { name: 'Putting - Gate', total: 10, met: 8, successRate: 80, averageScore: 7.2, minScore: 5, maxScore: 10 },
        { name: 'Chipping - Hoop', total: 5, met: 2, successRate: 40, averageScore: 4.8, minScore: 2, maxScore: 8 },
        { name: 'Pitching - Ladder', total: 8, met: 2, successRate: 25, averageScore: 3.5, minScore: 1, maxScore: 6 },
    ];

    it('renders counts in parentheses', () => {
        const { getByText } = render(<DrillStatsChart stats={mockStats} />);

        expect(getByText('(8/10)')).toBeTruthy();
        expect(getByText('(2/5)')).toBeTruthy();
        expect(getByText('(2/8)')).toBeTruthy();
    });

    it('limits display to 8 drills', () => {
        const manyStats: DrillStats[] = Array.from({ length: 12 }, (_, i) => ({
            name: `Drill ${i + 1}`,
            total: 10,
            met: 5,
            successRate: 50,
            averageScore: 5.0,
            minScore: 2,
            maxScore: 8,
        }));

        const { queryByText } = render(<DrillStatsChart stats={manyStats} />);

        expect(queryByText('Drill 1')).toBeTruthy();
        expect(queryByText('Drill 8')).toBeTruthy();
        expect(queryByText('Drill 9')).toBeNull();
    });

    it('displays average score when available', () => {
        const { getByText } = render(<DrillStatsChart stats={mockStats} />);

        expect(getByText('Avg: 7.2')).toBeTruthy();
        expect(getByText('Avg: 4.8')).toBeTruthy();
        expect(getByText('Avg: 3.5')).toBeTruthy();
    });

    it('does not display average score when null', () => {
        const statsWithoutScores: DrillStats[] = [
            { name: 'Putting - Gate', total: 10, met: 8, successRate: 80, averageScore: null, minScore: null, maxScore: null },
        ];

        const { queryByText } = render(<DrillStatsChart stats={statsWithoutScores} />);

        expect(queryByText(/Avg:/)).toBeNull();
    });
});
