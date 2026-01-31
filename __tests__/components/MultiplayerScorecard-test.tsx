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
    it('shows course par header', () => {
        const { getByText } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={[]} />
        );

        expect(getByText('Par 72')).toBeTruthy();
    });

    it('shows player totals relative to par', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [5, 3] },
            { holeNumber: 2, holePar: 4, scores: [4, 5] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        // You: (5-4)+(4-4) = +1
        expect(getByTestId('player-total-1')).toHaveTextContent('+1');
        // Alice: (3-4)+(5-4) = E
        expect(getByTestId('player-total-2')).toHaveTextContent('E');
    });

    it('shows under par total as negative', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [3, 3] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('player-total-1')).toHaveTextContent('-1');
        expect(getByTestId('player-total-2')).toHaveTextContent('-1');
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
        const { getByText } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={[]} />
        );

        expect(getByText('Par 72')).toBeTruthy();
    });

    it('shows even par total as E', () => {
        const holeScores = makeScores([
            { holeNumber: 1, holePar: 4, scores: [4, 4] },
        ]);

        const { getByTestId } = render(
            <MultiplayerScorecard round={mockRound} players={mockPlayers} holeScores={holeScores} />
        );

        expect(getByTestId('player-total-1')).toHaveTextContent('E');
        expect(getByTestId('player-total-2')).toHaveTextContent('E');
    });
});
