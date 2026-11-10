import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RoundScoreTable from '../../components/RoundScoreTable';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const holes = [
    { holeNumber: 1, par: 4, score: 4 },
    { holeNumber: 2, par: 3, score: 5 },
    { holeNumber: 3, par: 5, score: 4 },
];

describe('RoundScoreTable', () => {
    it('shouldShowTheScorecardLabelAndHoleNumbersWithATotal', () => {
        const { getByText } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} />);

        expect(getByText('SCORECARD')).toBeTruthy();
        expect(getByText('Hole')).toBeTruthy();
        expect(getByText('Tot')).toBeTruthy();
    });

    it('shouldShowParAndTheUsersScoreForEachHoleWithTotals', () => {
        const { getByTestId, getByText } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} />);

        expect(getByTestId('round-table-par-1')).toHaveTextContent('4');
        expect(getByTestId('round-table-score-2')).toHaveTextContent('5');
        expect(getByText('12')).toBeTruthy();
        expect(getByText('13')).toBeTruthy();
    });

    it('shouldPutADotUnderEachHoleWithADeadlySin', () => {
        const { getByTestId, queryByTestId } = render(<RoundScoreTable holes={holes} sinHoles={new Set([2])} />);

        expect(getByTestId('round-table-dot-2')).toBeTruthy();
        expect(queryByTestId('round-table-dot-1')).toBeNull();
    });

    it('shouldReportTheHoleWhenItsDotIsTapped', () => {
        const onSinPress = jest.fn();
        const { getByTestId } = render(<RoundScoreTable holes={holes} sinHoles={new Set([2])} onSinPress={onSinPress} />);

        fireEvent.press(getByTestId('round-table-dot-2'));

        expect(onSinPress).toHaveBeenCalledWith(2);
    });

    it('shouldExplainWhatTheDotMeansWhenAnyHoleHasASin', () => {
        const { getByText } = render(<RoundScoreTable holes={holes} sinHoles={new Set([2])} />);

        expect(getByText('Dot marks a hole with a deadly sin')).toBeTruthy();
    });

    it('shouldNotShowTheDotExplanationWhenNoHoleHasASin', () => {
        const { queryByText } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} />);

        expect(queryByText('Dot marks a hole with a deadly sin')).toBeNull();
    });
});
