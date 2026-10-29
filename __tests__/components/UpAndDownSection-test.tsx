import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import UpAndDownSection from '../../components/UpAndDownSection';
import { getUpAndDownRateService } from '../../service/DbService';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../service/DbService', () => ({
    getUpAndDownRateService: jest.fn(() => ({ rate: '-', upAndDowns: 0, attempts: 0 })),
}));

const mockGetUpAndDownRate = getUpAndDownRateService as jest.Mock;

const renderSection = (filteredRoundIds?: Set<number>) =>
    render(
        <UpAndDownSection
            fadeAnim={new Animated.Value(1)}
            slideAnim={new Animated.Value(0)}
            filteredRoundIds={filteredRoundIds}
        />
    );

describe('UpAndDownSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldRenderNothingWhenNoMissedGreensRecorded', () => {
        mockGetUpAndDownRate.mockReturnValue({ rate: '-', upAndDowns: 0, attempts: 0 });

        const { queryByTestId, queryByText } = renderSection();

        expect(queryByTestId('up-and-down-rate')).toBeNull();
        expect(queryByText('Up & down')).toBeNull();
    });

    it('shouldShowRateAndMissedGreenDetailWhenAttemptsExist', () => {
        mockGetUpAndDownRate.mockReturnValue({ rate: '33%', upAndDowns: 1, attempts: 3 });

        const { getByTestId, getByText } = renderSection();

        expect(getByText('Up & down')).toBeTruthy();
        expect(getByTestId('up-and-down-rate').props.children).toBe('33%');
        expect(getByTestId('up-and-down-detail').props.children).toBe('1 of 3 missed greens');
    });

    it('shouldShowZeroPercentWhenMissedGreensNeverHoledOut', () => {
        mockGetUpAndDownRate.mockReturnValue({ rate: '0%', upAndDowns: 0, attempts: 2 });

        const { getByTestId } = renderSection();

        expect(getByTestId('up-and-down-rate').props.children).toBe('0%');
        expect(getByTestId('up-and-down-detail').props.children).toBe('0 of 2 missed greens');
    });

    it('shouldShowOneHundredPercentWhenEveryMissedGreenHoledOut', () => {
        mockGetUpAndDownRate.mockReturnValue({ rate: '100%', upAndDowns: 4, attempts: 4 });

        const { getByTestId } = renderSection();

        expect(getByTestId('up-and-down-rate').props.children).toBe('100%');
    });

    it('shouldScopeCalculationToFilteredRounds', () => {
        mockGetUpAndDownRate.mockReturnValue({ rate: '-', upAndDowns: 0, attempts: 0 });
        const roundIds = new Set([7, 8]);

        renderSection(roundIds);

        expect(mockGetUpAndDownRate).toHaveBeenCalledWith(roundIds);
    });
});
