import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import DeadlySinsSection from '../../components/DeadlySinsSection';
import { getAllDeadlySinsRoundsService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getAllDeadlySinsRoundsService: jest.fn(() => [{ RoundId: 1 }]),
}));

jest.mock('../../components/DeadlySinsChart', () => () => null);

const props = (ids: Set<number>) => ({
    fadeAnim: new Animated.Value(1),
    slideAnim: new Animated.Value(0),
    roundsFilter: 'all' as const,
    filteredRoundIds: ids,
});

describe('DeadlySinsSection', () => {
    beforeEach(() => jest.clearAllMocks());

    it('shouldReadTheDeadlySinRoundsOnceAndReuseThemOnRerender', () => {
        const ids = new Set([1]);
        const { rerender } = render(<DeadlySinsSection {...props(ids)} />);
        expect(getAllDeadlySinsRoundsService).toHaveBeenCalledTimes(1);
        (getAllDeadlySinsRoundsService as jest.Mock).mockClear();

        rerender(<DeadlySinsSection {...props(ids)} />);

        expect(getAllDeadlySinsRoundsService).not.toHaveBeenCalled();
    });
});
