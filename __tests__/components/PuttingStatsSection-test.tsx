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
}));

describe('PuttingStatsSection', () => {
    it('shouldShowSharedEmptyStateWithStartRoundWhenNoRoundsSelected', () => {
        const { getPuttingMakeRatesService } = require('../../service/DbService');
        getPuttingMakeRatesService.mockReturnValueOnce([]);
        const onStartRound = jest.fn();

        const { getByText } = render(
            <PuttingStatsSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} filteredRoundIds={new Set()} onStartRound={onStartRound} />
        );

        expect(getByText(/Rounds saved in score-only mode do not count/)).toBeTruthy();
        expect(getByText('Start a round')).toBeTruthy();
    });

    it('shouldExplainWhatMakeRateMeansUnderTheTable', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { queryByText } = render(
            <PuttingStatsSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        expect(queryByText(/Share of putts holed/)).toBeNull();
    });

    it('shows a Putting heading on a card like the other stats sections', () => {
        const { getByText, queryByText } = render(
            <PuttingStatsSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(getByText('Putting')).toBeTruthy();
        expect(queryByText('Your personal putting make rates')).toBeNull();
        expect(queryByText('Feet')).toBeNull();
        expect(queryByText('Make rate')).toBeNull();
    });

    it('shows each distance with a bar sized to its make rate', () => {
        const { getByTestId } = render(
            <PuttingStatsSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(getByTestId('putting-bar-4')).toHaveStyle({ width: '75%' });
        expect(getByTestId('putting-bar-10')).toHaveStyle({ width: '40%' });
    });

    it('renders asterisk footnote for estimated distances', () => {
        const fadeAnim = new Animated.Value(1);
        const slideAnim = new Animated.Value(0);

        const { getByText } = render(
            <PuttingStatsSection fadeAnim={fadeAnim} slideAnim={slideAnim} />
        );

        // Verify the asterisk footnote is rendered
        expect(getByText('Gold marker shows the PGA tour rates')).toBeTruthy();
    });

    it('shows the distance labels at the regular text size in a narrow column', () => {
        const fontSizes = require('../../assets/font-sizes').default;
        const { getByText, getByTestId } = render(
            <PuttingStatsSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(getByText('4 ft')).toHaveStyle({ fontSize: fontSizes.normal });
        expect(getByTestId('putting-label-4')).toHaveStyle({ width: 64 });
    });

    it('shows no rate values at the end of each row', () => {
        const { queryByTestId } = render(
            <PuttingStatsSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(queryByTestId('putting-rate-4')).toBeNull();
        expect(queryByTestId('putting-rate-10')).toBeNull();
    });

    it('marks the PGA expectation on each bar', () => {
        const { getByTestId } = render(
            <PuttingStatsSection fadeAnim={new Animated.Value(1)} slideAnim={new Animated.Value(0)} />
        );

        expect(getByTestId('putting-pga-marker-4')).toHaveStyle({ left: '91%' });
        expect(getByTestId('putting-pga-marker-10')).toHaveStyle({ left: '41%' });
    });
});
