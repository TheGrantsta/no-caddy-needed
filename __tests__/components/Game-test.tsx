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
    useStyles: () => require('../../assets/stlyes').default,
}));

describe('Game component', () => {
    const defaultProps = {
        header: 'Up & down challenge!',
        objective: 'Simulate on-course pressure',
        setUp: 'Select chipping spots',
        howToPlay: 'Hole out in 2 shots',
        isActive: true,
    };

    it('rendersTheGameHeader', () => {
        const { getByText } = render(<Game {...defaultProps} />);
        expect(getByText('Up & down challenge!')).toBeTruthy();
    });

    it('rendersInstructions', () => {
        const { getByText } = render(<Game {...defaultProps} />);
        expect(getByText(/Simulate on-course pressure/)).toBeTruthy();
    });

    it('rendersActiveToggle', () => {
        const { getByTestId } = render(<Game {...defaultProps} />);
        expect(getByTestId('game-active-toggle')).toBeTruthy();
    });

    it('callsOnToggleActiveWithFalseWhenActiveAndTogglePressed', () => {
        const mockToggle = jest.fn();
        const { getByTestId } = render(<Game {...defaultProps} isActive={true} onToggleActive={mockToggle} />);
        fireEvent.press(getByTestId('game-active-toggle'));
        expect(mockToggle).toHaveBeenCalledWith(false);
    });

    it('callsOnToggleActiveWithTrueWhenInactiveAndTogglePressed', () => {
        const mockToggle = jest.fn();
        const { getByTestId } = render(<Game {...defaultProps} isActive={false} onToggleActive={mockToggle} />);
        fireEvent.press(getByTestId('game-active-toggle'));
        expect(mockToggle).toHaveBeenCalledWith(true);
    });

    it('doesNotThrowIfOnToggleActiveNotProvided', () => {
        const { getByTestId } = render(<Game {...defaultProps} />);
        expect(() => fireEvent.press(getByTestId('game-active-toggle'))).not.toThrow();
    });

    it('showsActiveTextWhenActive', () => {
        const { getByText } = render(<Game {...defaultProps} isActive={true} />);
        expect(getByText('Active:')).toBeTruthy();
    });

    it('showsInactiveTextWhenInactive', () => {
        const { getByText } = render(<Game {...defaultProps} isActive={false} />);
        expect(getByText('Inactive:')).toBeTruthy();
    });
});
