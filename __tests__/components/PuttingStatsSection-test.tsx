import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import PuttingStatsSection from '../../components/PuttingStatsSection';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../service/DbService', () => ({
    getPuttingMakeRatesService: jest.fn(() => [
        { distance: 4, makeRate: '75%', putts: 4 },
        { distance: 10, makeRate: '40%', putts: 10 },
    ]),
    formatPuttCount: jest.fn((count: number) => `${count}`),
}));

describe('PuttingStatsSection', () => {
    it('renders with personal putting data', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { getByText } = render(
            <PuttingStatsSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        // Check header is rendered
        expect(getByText('Your personal putting make rates')).toBeTruthy();

        // Check that the table rows contain the expected formatted pro rates
        // The test is checking that these exact strings exist (this pins the current output format)
        expect(getByText(/75%.*91%/)).toBeTruthy(); // 4ft: 75% personal, 91% PGA
        expect(getByText(/40%.*41%/)).toBeTruthy(); // 10ft: 40% personal, 41% PGA
    });

    it('renders asterisk footnote for estimated distances', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { getByText } = render(
            <PuttingStatsSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        // Verify the asterisk footnote is rendered
        expect(getByText(/Estimated or extrapolated/)).toBeTruthy();
    });
});
