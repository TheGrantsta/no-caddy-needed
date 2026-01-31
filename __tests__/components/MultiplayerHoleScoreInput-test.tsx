import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MultiplayerHoleScoreInput from '../../components/MultiplayerHoleScoreInput';
import { RoundPlayer } from '../../service/DbService';

const mockPlayers: RoundPlayer[] = [
    { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
    { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
];

describe('MultiplayerHoleScoreInput', () => {
    const mockOnSubmitScores = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows hole number header', () => {
        const { getByText } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        expect(getByText('Hole 1')).toBeTruthy();
    });

    it('shows par selector with 3, 4, 5 options', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        expect(getByTestId('par-3-button')).toBeTruthy();
        expect(getByTestId('par-4-button')).toBeTruthy();
        expect(getByTestId('par-5-button')).toBeTruthy();
    });

    it('defaults to par 4', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        expect(getByTestId('par-4-button')).toBeTruthy();
        // Default score should be 4 for each player
        expect(getByTestId('player-score-1')).toHaveTextContent('4');
        expect(getByTestId('player-score-2')).toHaveTextContent('4');
    });

    it('shows player names', () => {
        const { getByText } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        expect(getByText('You')).toBeTruthy();
        expect(getByText('Alice')).toBeTruthy();
    });

    it('shows increment and decrement buttons for each player', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        expect(getByTestId('increment-1')).toBeTruthy();
        expect(getByTestId('decrement-1')).toBeTruthy();
        expect(getByTestId('increment-2')).toBeTruthy();
        expect(getByTestId('decrement-2')).toBeTruthy();
    });

    it('increments player score when + is pressed', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('increment-1'));

        expect(getByTestId('player-score-1')).toHaveTextContent('5');
    });

    it('decrements player score when - is pressed', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('decrement-1'));

        expect(getByTestId('player-score-1')).toHaveTextContent('3');
    });

    it('does not decrement below 1', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        // Default is 4, decrement 3 times to reach 1
        fireEvent.press(getByTestId('decrement-1'));
        fireEvent.press(getByTestId('decrement-1'));
        fireEvent.press(getByTestId('decrement-1'));
        fireEvent.press(getByTestId('decrement-1'));

        expect(getByTestId('player-score-1')).toHaveTextContent('1');
    });

    it('shows Next hole button', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        expect(getByTestId('next-hole-button')).toBeTruthy();
    });

    it('submits all scores when Next hole is pressed', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={3} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('increment-1')); // You: 5
        fireEvent.press(getByTestId('decrement-2')); // Alice: 3

        fireEvent.press(getByTestId('next-hole-button'));

        expect(mockOnSubmitScores).toHaveBeenCalledWith(3, 4, [
            { playerId: 1, playerName: 'You', score: 5 },
            { playerId: 2, playerName: 'Alice', score: 3 },
        ]);
    });

    it('resets scores to new par when par changes', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('increment-1')); // You: 5
        expect(getByTestId('player-score-1')).toHaveTextContent('5');

        fireEvent.press(getByTestId('par-3-button'));

        expect(getByTestId('player-score-1')).toHaveTextContent('3');
        expect(getByTestId('player-score-2')).toHaveTextContent('3');
    });

    it('submits with par 3 when par 3 is selected', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('par-3-button'));
        fireEvent.press(getByTestId('next-hole-button'));

        expect(mockOnSubmitScores).toHaveBeenCalledWith(1, 3, [
            { playerId: 1, playerName: 'You', score: 3 },
            { playerId: 2, playerName: 'Alice', score: 3 },
        ]);
    });

    it('submits with par 5 when par 5 is selected', () => {
        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('par-5-button'));
        fireEvent.press(getByTestId('next-hole-button'));

        expect(mockOnSubmitScores).toHaveBeenCalledWith(1, 5, [
            { playerId: 1, playerName: 'You', score: 5 },
            { playerId: 2, playerName: 'Alice', score: 5 },
        ]);
    });

    it('resets scores when hole number changes', () => {
        const { getByTestId, rerender } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('increment-1')); // You: 5
        expect(getByTestId('player-score-1')).toHaveTextContent('5');

        rerender(
            <MultiplayerHoleScoreInput holeNumber={2} players={mockPlayers} onSubmitScores={mockOnSubmitScores} />
        );

        expect(getByTestId('player-score-1')).toHaveTextContent('4');
    });

    it('works with single player', () => {
        const singlePlayer: RoundPlayer[] = [
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        ];

        const { getByTestId } = render(
            <MultiplayerHoleScoreInput holeNumber={1} players={singlePlayer} onSubmitScores={mockOnSubmitScores} />
        );

        fireEvent.press(getByTestId('next-hole-button'));

        expect(mockOnSubmitScores).toHaveBeenCalledWith(1, 4, [
            { playerId: 1, playerName: 'You', score: 4 },
        ]);
    });
});
