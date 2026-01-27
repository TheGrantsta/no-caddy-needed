import React from 'react';
import { render } from '@testing-library/react-native';
import DrillStatsChart from '../../components/DrillStatsChart';
import { DrillStats } from '@/service/DbService';

describe('DrillStatsChart component', () => {
    const mockStats: DrillStats[] = [
        { name: 'Putting - Gate', total: 10, met: 8, successRate: 80 },
        { name: 'Chipping - Hoop', total: 5, met: 2, successRate: 40 },
        { name: 'Pitching - Ladder', total: 8, met: 2, successRate: 25 },
    ];

    it('renders the title', () => {
        const { getByText } = render(<DrillStatsChart stats={mockStats} />);

        expect(getByText('Success Rate by Drill')).toBeTruthy();
    });

    it('renders drill names', () => {
        const { getByText } = render(<DrillStatsChart stats={mockStats} />);

        expect(getByText('Putting - Gate')).toBeTruthy();
        expect(getByText('Chipping - Hoop')).toBeTruthy();
        expect(getByText('Pitching - Ladder')).toBeTruthy();
    });

    it('renders success rates', () => {
        const { getByText } = render(<DrillStatsChart stats={mockStats} />);

        expect(getByText('80%')).toBeTruthy();
        expect(getByText('40%')).toBeTruthy();
        expect(getByText('25%')).toBeTruthy();
    });

    it('renders counts in parentheses', () => {
        const { getByText } = render(<DrillStatsChart stats={mockStats} />);

        expect(getByText('(8/10)')).toBeTruthy();
        expect(getByText('(2/5)')).toBeTruthy();
        expect(getByText('(2/8)')).toBeTruthy();
    });

    it('renders the legend', () => {
        const { getByText } = render(<DrillStatsChart stats={mockStats} />);

        expect(getByText('≥70%')).toBeTruthy();
        expect(getByText('40-69%')).toBeTruthy();
        expect(getByText('<40%')).toBeTruthy();
    });

    it('returns null when stats array is empty', () => {
        const { queryByText } = render(<DrillStatsChart stats={[]} />);

        expect(queryByText('Success Rate by Drill')).toBeNull();
    });

    it('truncates long drill names', () => {
        const longNameStats: DrillStats[] = [
            { name: 'This is a very long drill name that should be truncated', total: 5, met: 3, successRate: 60 },
        ];

        const { getByText } = render(<DrillStatsChart stats={longNameStats} />);

        expect(getByText('This is a very lo...')).toBeTruthy();
    });

    it('limits display to 8 drills', () => {
        const manyStats: DrillStats[] = Array.from({ length: 12 }, (_, i) => ({
            name: `Drill ${i + 1}`,
            total: 10,
            met: 5,
            successRate: 50,
        }));

        const { queryByText } = render(<DrillStatsChart stats={manyStats} />);

        expect(queryByText('Drill 1')).toBeTruthy();
        expect(queryByText('Drill 8')).toBeTruthy();
        expect(queryByText('Drill 9')).toBeNull();
    });
});
