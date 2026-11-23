import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import colours from '../../assets/colours';
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

    it('shouldKeepEveryScoreSlotTheSameHeightSoASinDotDoesNotMisalignTheRow', () => {
        const { getByTestId } = render(<RoundScoreTable holes={holes} sinHoles={new Set([2])} />);

        const plain = StyleSheet.flatten(getByTestId('round-table-slot-1').props.style);
        const withDot = StyleSheet.flatten(getByTestId('round-table-slot-2').props.style);
        expect(plain.height).toBeGreaterThan(0);
        expect(withDot.height).toBe(plain.height);
        expect(StyleSheet.flatten(getByTestId('round-table-dot-2').props.style).position).toBe('absolute');
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

    describe('under and over par styling', () => {
        // Hole 1 is a birdie (under par), hole 2 a bogey (over par), hole 3 par
        const mixed = [
            { holeNumber: 1, par: 4, score: 3 },
            { holeNumber: 2, par: 3, score: 4 },
            { holeNumber: 3, par: 5, score: 5 },
        ];
        const circleRadius = 11; // half of the 22px marker, so the border forms a circle
        const borderOf = (testId: string, getByTestId: (id: string) => any) =>
            StyleSheet.flatten(getByTestId(testId).props.style);

        it('shouldShowABirdieAsARedCircleWithWhiteText', () => {
            const { getByTestId } = render(<RoundScoreTable holes={mixed} sinHoles={new Set()} />);

            const marker = borderOf('round-table-marker-1', getByTestId);
            expect(marker.backgroundColor).toBe(colours.errorText);
            expect(marker.borderRadius).toBe(circleRadius);
            expect(StyleSheet.flatten(getByTestId('round-table-score-1').props.style).color).toBe(colours.white);
        });

        it('shouldShowABogeyAsABlackCircleWithWhiteText', () => {
            const { getByTestId } = render(<RoundScoreTable holes={mixed} sinHoles={new Set()} />);

            const marker = borderOf('round-table-marker-2', getByTestId);
            expect(marker.backgroundColor).toBe(colours.black);
            expect(marker.borderRadius).toBe(circleRadius);
            expect(StyleSheet.flatten(getByTestId('round-table-score-2').props.style).color).toBe(colours.white);
        });

        it('shouldShowAParAsAGreyCircle', () => {
            const { getByTestId } = render(<RoundScoreTable holes={mixed} sinHoles={new Set()} />);

            const marker = borderOf('round-table-marker-3', getByTestId);
            expect(marker.backgroundColor).toBe('#9E9E9E');
            expect(marker.borderRadius).toBe(circleRadius);
        });

        it('shouldShowAnEagleAsAYellowCircleWithWhiteText', () => {
            const eagle = [{ holeNumber: 1, par: 5, score: 3 }];
            const { getByTestId } = render(<RoundScoreTable holes={eagle} sinHoles={new Set()} />);

            expect(borderOf('round-table-marker-1', getByTestId).backgroundColor).toBe('#FFD600');
            expect(StyleSheet.flatten(getByTestId('round-table-score-1').props.style).color).toBe(colours.white);
        });

        it('shouldShowADoubleBogeyOrWorseAsABlueCircle', () => {
            const blowup = [{ holeNumber: 1, par: 4, score: 7 }];
            const { getByTestId } = render(<RoundScoreTable holes={blowup} sinHoles={new Set()} />);

            expect(borderOf('round-table-marker-1', getByTestId).backgroundColor).toBe('#1F6FB2');
        });

        it('shouldStyleAnOtherPlayersScoreAgainstThatHolesPar', () => {
            const sam = { id: 2, name: 'Sam', scores: { 1: 3, 2: 3, 3: 5 } };
            const { getByTestId, queryByTestId } = render(
                <RoundScoreTable holes={mixed} sinHoles={new Set()} otherPlayers={[sam]} />
            );

            expect(StyleSheet.flatten(getByTestId('round-table-player-2-score-1').props.style).color).toBe(colours.white);
            expect(borderOf('round-table-player-2-marker-1', getByTestId).backgroundColor).toBe(colours.errorText);
            // Sam's 3 on the par 3 and 5 on the par 5 are at par: grey circles
            expect(borderOf('round-table-player-2-marker-2', getByTestId).backgroundColor).toBe('#9E9E9E');
            expect(queryByTestId('round-table-player-2-marker-3')).toBeTruthy();
        });

        it('shouldNotStyleAHoleAnOtherPlayerHasNoScoreFor', () => {
            const sam = { id: 2, name: 'Sam', scores: { 1: 5 } };
            const { getByTestId, queryByTestId } = render(
                <RoundScoreTable holes={mixed} sinHoles={new Set()} otherPlayers={[sam]} />
            );

            expect(queryByTestId('round-table-player-2-marker-2')).toBeNull();
            expect(getByTestId('round-table-player-2-score-2')).toHaveTextContent('-');
        });

        it('shouldKeepTheUsersTotalBlackWhenUnderPar', () => {
            // Sam: 3 + 3 = 6 vs par 4 + 3 = 7 -> under par; the user's total stays as it is at even par
            const sam = { id: 2, name: 'Sam', scores: { 1: 3, 2: 3 } };
            const { getByTestId } = render(
                <RoundScoreTable holes={mixed} sinHoles={new Set()} otherPlayers={[sam]} />
            );

            expect(StyleSheet.flatten(getByTestId('round-table-total-out').props.style).color).toBe(colours.black);
        });

        it('shouldNotColourAnotherPlayersTotalWhenUnderPar', () => {
            // Sam: 3 + 3 = 6 vs par 4 + 3 = 7 -> under par, so the total gets no colour (same as even par)
            const sam = { id: 2, name: 'Sam', scores: { 1: 3, 2: 3 } };
            const { getByTestId } = render(
                <RoundScoreTable holes={mixed} sinHoles={new Set()} otherPlayers={[sam]} />
            );

            expect(StyleSheet.flatten(getByTestId('round-table-player-2-total-out').props.style).color).toBeUndefined();
        });

        it('shouldKeepTheUsersTotalBlackWhenOverPar', () => {
            const { getByTestId } = render(<RoundScoreTable holes={holes} sinHoles={new Set()} />);

            // holes: 4+5+4 = 13 vs par 4+3+5 = 12 -> over par, but the total stays black
            expect(StyleSheet.flatten(getByTestId('round-table-total-out').props.style).color).toBe(colours.black);
        });

        it('shouldNotShowAColourLegend', () => {
            const { queryByText } = render(<RoundScoreTable holes={mixed} sinHoles={new Set()} />);

            expect(queryByText(/Yellow = eagle/)).toBeNull();
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
