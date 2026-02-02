import React from 'react';
import { render } from '@testing-library/react-native';
import MultiplayerScorecard from '../../components/MultiplayerScorecard';
import { Round, RoundPlayer, RoundHoleScore } from '../../service/DbService';

const mockRound: Round = {
    Id: 1,
    CoursePar: 72,
    TotalScore: 2,
    StartTime: '2025-06-15T10:00:00.000Z',
    EndTime: '2025-06-15T14:00:00.000Z',
    IsCompleted: 1,
    Created_At: '2025-06-15T10:00:00.000Z',
};

const mockPlayers: RoundPlayer[] = [
    { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
    { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
];

const makeScores = (holes: { holeNumber: number; holePar: number; scores: number[] }[]): RoundHoleScore[] => {
    let id = 1;
    const result: RoundHoleScore[] = [];
    holes.forEach(hole => {
        hole.scores.forEach((score, playerIndex) => {
            result.push({
                Id: id++,
                RoundId: 1,
                RoundPlayerId: mockPlayers[playerIndex].Id,
                HoleNumber: hole.holeNumber,
                HolePar: hole.holePar,
                Score: score,
            });
        });
    });
    return result;
};

describe('MultiplayerScorecard', () => {
    it('shows player totals relative to par', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [5, 3] },
            { holeNumber: 2, holePar: 4, scores: [4, 5] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        // You: (5-4)+(4-4) = +1
        expect(getByTestId('player-total-1')).toHaveTextContent('(+1)');
        // Alice: (3-4)+(5-4) = E
        expect(getByTestId('player-total-2')).toHaveTextContent('(E)');
    });

    it('shows under par total as negative', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [3, 3] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('player-total-1')).toHaveTextContent('(-1)');
        expect(getByTestId('player-total-2')).toHaveTextContent('(-1)');
    });

    it('shows front 9 section when holes exist', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [4, 4] },
        ]);

        const { getByText } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByText('Front 9')).toBeTruthy();
    });

    it('shows back 9 section when holes > 9 exist', () => {
        const holeScores = makeScores([
            { holeNumber: 10, holePar: 4, scores: [4, 4] },
        ]);

        const { getByText } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByText('Back 9')).toBeTruthy();
    });

    it('shows hole numbers in grid', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [4, 5] },
            { holeNumber: 2, holePar: 3, scores: [3, 3] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('hole-number-1')).toHaveTextContent('1');
        expect(getByTestId('hole-number-2')).toHaveTextContent('2');
    });

    it('shows correct number of holes in grid', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [4, 5] },
            { holeNumber: 2, holePar: 3, scores: [3, 3] },
            { holeNumber: 3, holePar: 5, scores: [5, 4] },
            { holeNumber: 4, holePar: 4, scores: [4, 5] },
            { holeNumber: 5, holePar: 3, scores: [3, 3] },
            { holeNumber: 6, holePar: 5, scores: [5, 4] },
            { holeNumber: 7, holePar: 4, scores: [4, 5] },
            { holeNumber: 8, holePar: 3, scores: [3, 3] },
            { holeNumber: 9, holePar: 5, scores: [5, 4] },
            { holeNumber: 10, holePar: 4, scores: [4, 5] },
            { holeNumber: 11, holePar: 3, scores: [3, 3] },
            { holeNumber: 12, holePar: 5, scores: [5, 4] },
            { holeNumber: 13, holePar: 4, scores: [4, 5] },
            { holeNumber: 14, holePar: 3, scores: [3, 3] },
            { holeNumber: 15, holePar: 5, scores: [5, 4] },
            { holeNumber: 16, holePar: 4, scores: [4, 5] },
            { holeNumber: 17, holePar: 3, scores: [3, 3] },
            { holeNumber: 18, holePar: 5, scores: [5, 4] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('hole-number-1')).toBeTruthy();
        expect(getByTestId('hole-number-2')).toBeTruthy();
        expect(getByTestId('hole-number-3')).toBeTruthy();
        expect(getByTestId('hole-number-4')).toBeTruthy();
        expect(getByTestId('hole-number-5')).toBeTruthy();
        expect(getByTestId('hole-number-6')).toBeTruthy();
        expect(getByTestId('hole-number-7')).toBeTruthy();
        expect(getByTestId('hole-number-8')).toBeTruthy();
        expect(getByTestId('hole-number-9')).toBeTruthy();
        expect(getByTestId('hole-number-10')).toBeTruthy();
        expect(getByTestId('hole-number-11')).toBeTruthy();
        expect(getByTestId('hole-number-12')).toBeTruthy();
        expect(getByTestId('hole-number-13')).toBeTruthy();
        expect(getByTestId('hole-number-14')).toBeTruthy();
        expect(getByTestId('hole-number-15')).toBeTruthy();
        expect(getByTestId('hole-number-16')).toBeTruthy();
        expect(getByTestId('hole-number-17')).toBeTruthy();
        expect(getByTestId('hole-number-18')).toBeTruthy();

        expect(getByTestId('hole-par-17')).toHaveTextContent('3');
        expect(getByTestId('hole-par-18')).toHaveTextContent('5');
    });

    it('shows par row in grid', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [4, 5] },
            { holeNumber: 2, holePar: 3, scores: [3, 3] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('hole-par-1')).toHaveTextContent('4');
        expect(getByTestId('hole-par-2')).toHaveTextContent('3');
    });

    it('shows player scores per hole', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [5, 3] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('hole-1-player-1-score')).toHaveTextContent('5');
        expect(getByTestId('hole-1-player-2-score')).toHaveTextContent('3');
    });

    it('shows player names in scorecard', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [4, 4] },
        ]);

        const { getAllByText } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getAllByText('You').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty hole scores', () => {
        const { queryByText } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={[]} />
        );

        expect(queryByText('Front 9')).toBeNull();
        expect(queryByText('Back 9')).toBeNull();
    });

    it('shows even par total as E', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [4, 4] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('player-total-1')).toHaveTextContent('(E)');
        expect(getByTestId('player-total-2')).toHaveTextContent('(E)');
    });

    describe('Grid font sizes', () => {
        it('uses same font size for hole numbers as player scores', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [4, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('hole-number-1')).toHaveStyle({ fontSize: 18 });
        });

        it('uses same font size for par values as player scores', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [4, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('hole-par-1')).toHaveStyle({ fontSize: 18 });
        });
    });

    describe('Summary section', () => {
        it('shows player relative-to-par score in summary', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 3] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('player-total-1')).toHaveTextContent('(+1)');
            expect(getByTestId('player-total-2')).toHaveTextContent('(-1)');
        });

        it('shows stroke total in summary with single nine data', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 3] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('round-player-1-total')).toHaveTextContent('5');
            expect(getByTestId('round-player-2-total')).toHaveTextContent('3');
        });
    });

    describe('Score colour coding', () => {
        it('applies yellow colour to par scores', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [4, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('hole-1-player-1-score')).toHaveStyle({ color: '#ffd33d' });
        });

        it('applies green colour to under par scores', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [3, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('hole-1-player-1-score')).toHaveStyle({ color: '#00C851' });
        });

        it('applies red colour to over par scores', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('hole-1-player-1-score')).toHaveStyle({ color: '#fd0303' });
        });
    });

    describe('Total colour coding', () => {
        it('applies yellow colour to even par total', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [4, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('player-total-1')).toHaveStyle({ color: '#ffd33d' });
        });

        it('applies green colour to under par total', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [3, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('player-total-1')).toHaveStyle({ color: '#00C851' });
        });

        it('applies red colour to over par total', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('player-total-1')).toHaveStyle({ color: '#fd0303' });
        });
    });

    describe('Nine-hole sub-totals', () => {
        it('shows front 9 par total', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [4, 4] },
                { holeNumber: 2, holePar: 3, scores: [3, 3] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('front9-par-total')).toHaveTextContent('7');
        });

        it('shows front 9 player stroke totals', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 3] },
                { holeNumber: 2, holePar: 3, scores: [3, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('front9-player-1-total')).toHaveTextContent('8');
            expect(getByTestId('front9-player-2-total')).toHaveTextContent('7');
        });

        it('shows back 9 par total', () => {
            const holeScores = makeScores([
                { holeNumber: 10, holePar: 4, scores: [4, 4] },
                { holeNumber: 11, holePar: 5, scores: [5, 5] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('back9-par-total')).toHaveTextContent('9');
        });

        it('shows back 9 player stroke totals', () => {
            const holeScores = makeScores([
                { holeNumber: 10, holePar: 4, scores: [5, 3] },
                { holeNumber: 11, holePar: 5, scores: [4, 6] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('back9-player-1-total')).toHaveTextContent('9');
            expect(getByTestId('back9-player-2-total')).toHaveTextContent('9');
        });

        it('colour codes sub-total yellow when at par', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [4, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('front9-player-1-total')).toHaveStyle({ color: '#ffd33d' });
        });

        it('colour codes sub-total green when under par', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [3, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('front9-player-1-total')).toHaveStyle({ color: '#00C851' });
        });

        it('colour codes sub-total red when over par', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 4] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('front9-player-1-total')).toHaveStyle({ color: '#fd0303' });
        });

        it('shows round total as sum of front and back 9 stroke totals', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 3] },
                { holeNumber: 10, holePar: 4, scores: [3, 5] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            expect(getByTestId('round-player-1-total')).toHaveTextContent('8');
            expect(getByTestId('round-player-2-total')).toHaveTextContent('8');
        });

        it('colour codes round stroke total based on par', () => {
            const holeScores = makeScores([
                { holeNumber: 1, holePar: 4, scores: [5, 3] },
                { holeNumber: 10, holePar: 4, scores: [5, 3] },
            ]);

            const { getByTestId } = render(
                <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
            );

            // You: 10 strokes, par 8 -> over par -> red
            expect(getByTestId('round-player-1-total')).toHaveStyle({ color: '#fd0303' });
            // Alice: 6 strokes, par 8 -> under par -> green
            expect(getByTestId('round-player-2-total')).toHaveStyle({ color: '#00C851' });
        });
    });
});
