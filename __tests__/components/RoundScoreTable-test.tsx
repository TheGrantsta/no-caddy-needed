import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import RoundScoreTable from '../../components/RoundScoreTable';

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

    describe('other players', () => {
        const sam = { id: 2, name: 'Sam', scores: { 1: 5, 2: 3, 3: 4 } };

        it('shouldShowEachOtherPlayersNameInTheirOwnRow', () => {
            const { getByText } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} otherPlayers={[sam]} />);

            expect(getByText('Sam')).toBeTruthy();
        });

        it('shouldShowEachOtherPlayersScoreForEachHole', () => {
            const { getByTestId } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} otherPlayers={[sam]} />);

            expect(getByTestId('round-table-player-2-score-1')).toHaveTextContent('5');
            expect(getByTestId('round-table-player-2-score-2')).toHaveTextContent('3');
            expect(getByTestId('round-table-player-2-score-3')).toHaveTextContent('4');
        });

        it('shouldShowADashForAHoleTheOtherPlayerHasNoScoreFor', () => {
            const partial = { ...sam, scores: { 1: 5 } };
            const { getByTestId } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} otherPlayers={[partial]} />);

            expect(getByTestId('round-table-player-2-score-2')).toHaveTextContent('-');
        });

        it('shouldTotalTheOtherPlayersScoresForTheNineOnlyFromHolesTheyPlayed', () => {
            const partial = { ...sam, scores: { 1: 5, 3: 4 } };
            const { getByTestId } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} otherPlayers={[partial]} />);

            expect(getByTestId('round-table-player-2-total-out')).toHaveTextContent('9');
        });

        it('shouldShowAnOtherPlayersScoresInTheInTableForHolesTenOnwards', () => {
            const holesFrom = (from: number, to: number) =>
                Array.from({ length: to - from + 1 }, (_, i) => ({ holeNumber: from + i, par: 4, score: 4 }));
            const back = { id: 2, name: 'Sam', scores: { 10: 3, 11: 6 } };
            const { getByTestId } = render(<RoundScoreTable holes={holesFrom(1, 18)} sinHoles={new Set()} otherPlayers={[back]} />);

            expect(getByTestId('round-table-player-2-score-10')).toHaveTextContent('3');
            expect(getByTestId('round-table-player-2-total-in')).toHaveTextContent('9');
        });

        it('shouldGiveTheNameColumnRoomForANameLikePlayer1', () => {
            const player1 = { id: 2, name: 'Player 1', scores: { 1: 5 } };
            const { getByText } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} otherPlayers={[player1]} />);
            const nameWidth = StyleSheet.flatten(getByText('Player 1').props.style).width as number;
            const headerWidth = StyleSheet.flatten(getByText('Hole').props.style).width;

            expect(nameWidth).toBeGreaterThanOrEqual(80);
            expect(nameWidth).toBe(headerWidth);
        });

        it('shouldShowNoExtraRowsWhenThereAreNoOtherPlayers', () => {
            const { queryByTestId, queryByText } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} otherPlayers={[]} />);

            expect(queryByTestId('round-table-player-2-score-1')).toBeNull();
            expect(queryByText('Sam')).toBeNull();
        });
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
