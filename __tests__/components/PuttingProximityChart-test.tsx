import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import PuttingProximityChart from '../../components/PuttingProximityChart';
import { PuttingProximity } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('PuttingProximityChart', () => {
    it('renders without crashing', () => {
        const data: PuttingProximity[] = [
            { distance: 5, shortPercent: '60%', longPercent: '40%' },
            { distance: 10, shortPercent: '70%', longPercent: '30%' },
        ];

        const { toJSON } = render(<PuttingProximityChart data={data} />);
        expect(toJSON()).toBeTruthy();
    });

    it('renders one row per bucket', () => {
        const data: PuttingProximity[] = [
            { distance: 5, shortPercent: '60%', longPercent: '40%' },
            { distance: 10, shortPercent: '70%', longPercent: '30%' },
            { distance: 15, shortPercent: '55%', longPercent: '45%' },
        ];

        const { getByText } = render(<PuttingProximityChart data={data} />);
        expect(getByText('5 ft')).toBeTruthy();
        expect(getByText('10 ft')).toBeTruthy();
        expect(getByText('15 ft')).toBeTruthy();
    });

    it('displays short and long percentages for each row', () => {
        const data: PuttingProximity[] = [
            { distance: 5, shortPercent: '62%', longPercent: '38%' },
        ];

        const { getByText } = render(<PuttingProximityChart data={data} />);
        expect(getByText('62% short / 38% long')).toBeTruthy();
    });

    it('renders empty buckets with dash', () => {
        const data: PuttingProximity[] = [
            { distance: 5, shortPercent: '-', longPercent: '-' },
        ];

        const { getByText } = render(<PuttingProximityChart data={data} />);
        expect(getByText('-')).toBeTruthy();
    });

    it('renders multiple rows with mixed data', () => {
        const data: PuttingProximity[] = [
            { distance: 5, shortPercent: '60%', longPercent: '40%' },
            { distance: 10, shortPercent: '-', longPercent: '-' },
            { distance: 15, shortPercent: '75%', longPercent: '25%' },
        ];

        const { getByText } = render(<PuttingProximityChart data={data} />);
        expect(getByText('60% short / 40% long')).toBeTruthy();
        expect(getByText('75% short / 25% long')).toBeTruthy();
    });

    it('renders testID for each row', () => {
        const data: PuttingProximity[] = [
            { distance: 5, shortPercent: '60%', longPercent: '40%' },
            { distance: 10, shortPercent: '70%', longPercent: '30%' },
        ];

        const { getByTestId } = render(<PuttingProximityChart data={data} />);
        expect(getByTestId('proximity-row-5')).toBeTruthy();
        expect(getByTestId('proximity-row-10')).toBeTruthy();
    });
});
