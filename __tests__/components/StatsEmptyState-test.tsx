import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StatsEmptyState from '../../components/StatsEmptyState';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('StatsEmptyState', () => {
    it('shouldExplainHowToSeeStatsAndThatScoreOnlyRoundsAreExcluded', () => {
        const { getByText } = render(<StatsEmptyState onStartRound={jest.fn()} />);

        expect(getByText('Complete a round to see stats.')).toBeTruthy();
        expect(getByText(/score-only mode do not count/)).toBeTruthy();
    });

    it('shouldCallOnStartRoundWhenStartRoundPressed', () => {
        const onStartRound = jest.fn();
        const { getByText } = render(<StatsEmptyState onStartRound={onStartRound} />);

        fireEvent.press(getByText('Start a round'));

        expect(onStartRound).toHaveBeenCalledTimes(1);
    });

    it('shouldHideStartRoundButtonWhenNoHandlerProvided', () => {
        const { queryByText } = render(<StatsEmptyState />);

        expect(queryByText('Start a round')).toBeNull();
    });
});
