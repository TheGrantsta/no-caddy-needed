import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import ProximitySection from '../../components/ProximitySection';
import { getPuttingProximityService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getPuttingProximityService: jest.fn(() => [
        { distance: 5, shortPercent: '50%', longPercent: '25%' },
    ]),
}));

jest.mock('../../components/PuttingProximityChart', () => () => null);

const props = () => ({
    fadeAnim: new Animated.Value(1),
    slideAnim: new Animated.Value(0),
    proximityThreePuttOnly: false,
    onProximityFilterChange: jest.fn(),
});

describe('ProximitySection', () => {
    beforeEach(() => jest.clearAllMocks());

    it('shouldReadTheProximityDataOnceAndReuseItOnRerender', () => {
        const ids = new Set([1, 2]);
        const { rerender } = render(<ProximitySection {...props()} filteredRoundIds={ids} />);
        expect(getPuttingProximityService).toHaveBeenCalledTimes(1);
        (getPuttingProximityService as jest.Mock).mockClear();

        rerender(<ProximitySection {...props()} filteredRoundIds={ids} />);

        expect(getPuttingProximityService).not.toHaveBeenCalled();
    });

    it('shouldShowTheSharedEmptyStateWithoutACardWhenNoRoundsAreSelected', () => {
        (getPuttingProximityService as jest.Mock).mockReturnValueOnce([]);
        const { queryByTestId, getByText } = render(<ProximitySection {...props()} filteredRoundIds={new Set()} />);

        expect(queryByTestId('proximity-card')).toBeNull();
        expect(getByText('Complete a round to see stats.')).toBeTruthy();
    });
});
