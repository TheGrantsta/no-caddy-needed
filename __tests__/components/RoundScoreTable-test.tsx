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

        expect(getByText('SCORECARD · OUT')).toBeTruthy();
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

    describe('Out and In tables', () => {
        const holesFrom = (from: number, to: number) =>
            Array.from({ length: to - from + 1 }, (_, i) => ({ holeNumber: from + i, par: 4, score: 4 }));

        it('shouldLabelAFiveHoleRoundAsOutWithOneTable', () => {
            const { getByText, queryByText, getByTestId } = render(
                <RoundScoreTable holes={holesFrom(1, 5)} sinHoles={new Set()} />
            );

            expect(getByText('SCORECARD · OUT')).toBeTruthy();
            expect(queryByText('SCORECARD · IN')).toBeNull();
            expect(getByTestId('round-table-card-out')).toBeTruthy();
        });

        it('shouldSplitAnEighteenHoleRoundIntoOutAndInTables', () => {
            const { getByText, getByTestId } = render(
                <RoundScoreTable holes={holesFrom(1, 18)} sinHoles={new Set()} />
            );

            expect(getByText('SCORECARD · OUT')).toBeTruthy();
            expect(getByText('SCORECARD · IN')).toBeTruthy();
            expect(getByTestId('round-table-card-in')).toBeTruthy();
        });
    });
});
