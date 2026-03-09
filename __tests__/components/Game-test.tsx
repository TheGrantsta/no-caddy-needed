import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Game from '../../components/Game';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('Game component', () => {
    const defaultProps = {
        header: 'Up & down challenge!',
        objective: 'Simulate on-course pressure',
        setUp: 'Select chipping spots',
        howToPlay: 'Hole out in 2 shots',
    };

    it('rendersTheGameHeader', () => {
        const { getByText } = render(<Game {...defaultProps} />);
        expect(getByText('Up & down challenge!')).toBeTruthy();
    });

    it('rendersInstructions', () => {
        const { getByText } = render(<Game {...defaultProps} />);
        expect(getByText(/Simulate on-course pressure/)).toBeTruthy();
    });

    it('rendersDeleteButtonInitially', () => {
        const { getByTestId } = render(<Game {...defaultProps} />);
        expect(getByTestId('delete-game-button')).toBeTruthy();
    });

    it('doesNotCallOnDeleteWhenDeleteButtonFirstPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Game {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-game-button'));
        expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('showsConfirmationButtonsAfterDeletePressed', () => {
        const { getByTestId } = render(<Game {...defaultProps} />);
        fireEvent.press(getByTestId('delete-game-button'));
        expect(getByTestId('confirm-game-delete')).toBeTruthy();
        expect(getByTestId('cancel-game-delete')).toBeTruthy();
    });

    it('hidesDeleteButtonAfterDeletePressed', () => {
        const { getByTestId, queryByTestId } = render(<Game {...defaultProps} />);
        fireEvent.press(getByTestId('delete-game-button'));
        expect(queryByTestId('delete-game-button')).toBeNull();
    });

    it('callsOnDeleteWhenConfirmPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Game {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-game-button'));
        fireEvent.press(getByTestId('confirm-game-delete'));
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('doesNotCallOnDeleteWhenCancelPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Game {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-game-button'));
        fireEvent.press(getByTestId('cancel-game-delete'));
        expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('hidesConfirmationButtonsAfterCancelPressed', () => {
        const { getByTestId, queryByTestId } = render(<Game {...defaultProps} />);
        fireEvent.press(getByTestId('delete-game-button'));
        fireEvent.press(getByTestId('cancel-game-delete'));
        expect(queryByTestId('confirm-game-delete')).toBeNull();
        expect(queryByTestId('cancel-game-delete')).toBeNull();
    });

    it('showsDeleteButtonAfterCancelPressed', () => {
        const { getByTestId } = render(<Game {...defaultProps} />);
        fireEvent.press(getByTestId('delete-game-button'));
        fireEvent.press(getByTestId('cancel-game-delete'));
        expect(getByTestId('delete-game-button')).toBeTruthy();
    });

    it('showsDeleteButtonAfterConfirmPressed', () => {
        const mockOnDelete = jest.fn();
        const { getByTestId } = render(<Game {...defaultProps} onDelete={mockOnDelete} />);
        fireEvent.press(getByTestId('delete-game-button'));
        fireEvent.press(getByTestId('confirm-game-delete'));
        expect(getByTestId('delete-game-button')).toBeTruthy();
    });

    it('doesNotThrowIfOnDeleteNotProvided', () => {
        const { getByTestId } = render(<Game {...defaultProps} />);
        fireEvent.press(getByTestId('delete-game-button'));
        expect(() => fireEvent.press(getByTestId('confirm-game-delete'))).not.toThrow();
    });

    it('doesNotRenderActiveToggle', () => {
        const { queryByTestId } = render(<Game {...defaultProps} />);
        expect(queryByTestId('game-active-toggle')).toBeNull();
    });
});
