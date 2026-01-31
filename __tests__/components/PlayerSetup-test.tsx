import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlayerSetup from '../../components/PlayerSetup';

describe('PlayerSetup', () => {
    const mockOnStartRound = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows You as fixed first player', () => {
        const { getByText } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(getByText('You')).toBeTruthy();
    });

    it('shows Add player button', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(getByTestId('add-player-button')).toBeTruthy();
    });

    it('shows Start button', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        expect(getByTestId('start-button')).toBeTruthy();
    });

    it('adds a player input when Add player is pressed', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));

        expect(getByTestId('player-name-input-0')).toBeTruthy();
    });

    it('adds up to 3 additional players', () => {
        const { getByTestId, queryByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));

        expect(getByTestId('player-name-input-0')).toBeTruthy();
        expect(getByTestId('player-name-input-1')).toBeTruthy();
        expect(getByTestId('player-name-input-2')).toBeTruthy();
        expect(queryByTestId('add-player-button')).toBeNull();
    });

    it('removes a player when remove button is pressed', () => {
        const { getByTestId, queryByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        expect(getByTestId('player-name-input-0')).toBeTruthy();

        fireEvent.press(getByTestId('remove-player-0'));
        expect(queryByTestId('player-name-input-0')).toBeNull();
    });

    it('calls onStartRound with empty array when no players added', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('start-button'));

        expect(mockOnStartRound).toHaveBeenCalledWith([]);
    });

    it('calls onStartRound with player names', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.changeText(getByTestId('player-name-input-1'), 'Bob');

        fireEvent.press(getByTestId('start-button'));

        expect(mockOnStartRound).toHaveBeenCalledWith(['Alice', 'Bob']);
    });

    it('filters out empty player names on start', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');

        fireEvent.press(getByTestId('add-player-button'));
        // Leave second input empty

        fireEvent.press(getByTestId('start-button'));

        expect(mockOnStartRound).toHaveBeenCalledWith(['Alice']);
    });

    it('shows add player button again after removing a player when at max', () => {
        const { getByTestId } = render(<PlayerSetup onStartRound={mockOnStartRound} />);

        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));
        fireEvent.press(getByTestId('add-player-button'));

        fireEvent.press(getByTestId('remove-player-1'));

        expect(getByTestId('add-player-button')).toBeTruthy();
    });
});
