import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScoreEditor from '../../components/ScoreEditor';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const defaultProps = {
    holeNumber: 1,
    playerName: 'You',
    score: 4,
    holePar: 4,
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    onParChange: jest.fn(),
};

describe('ScoreEditor', () => {
    it('shows hole number and player name', () => {
        const { getByText } = render(
            <ScoreEditor {...defaultProps} holeNumber={3} playerName="Alice" />
        );

        expect(getByText('#3 - Alice')).toBeTruthy();
    });

    it('shows current score', () => {
        const { getByTestId } = render(<ScoreEditor {...defaultProps} />);

        expect(getByTestId('score-editor-value')).toHaveTextContent('4');
    });

    it('calls onIncrement when + pressed', () => {
        const onIncrement = jest.fn();
        const { getByTestId } = render(<ScoreEditor {...defaultProps} onIncrement={onIncrement} />);

        fireEvent.press(getByTestId('score-editor-increment'));

        expect(onIncrement).toHaveBeenCalled();
    });

    it('calls onDecrement when - pressed', () => {
        const onDecrement = jest.fn();
        const { getByTestId } = render(<ScoreEditor {...defaultProps} onDecrement={onDecrement} />);

        fireEvent.press(getByTestId('score-editor-decrement'));

        expect(onDecrement).toHaveBeenCalled();
    });

    it('showsParButtons3And4And5', () => {
        const { getByTestId } = render(<ScoreEditor {...defaultProps} />);

        expect(getByTestId('score-editor-par-3')).toBeTruthy();
        expect(getByTestId('score-editor-par-4')).toBeTruthy();
        expect(getByTestId('score-editor-par-5')).toBeTruthy();
    });

    it('callsOnParChangeWithCorrectValueWhenParButtonPressed', () => {
        const onParChange = jest.fn();
        const { getByTestId } = render(<ScoreEditor {...defaultProps} onParChange={onParChange} />);

        fireEvent.press(getByTestId('score-editor-par-3'));

        expect(onParChange).toHaveBeenCalledWith(3);
    });

    it('highlightsActiveParButton', () => {
        const { getByTestId } = render(<ScoreEditor {...defaultProps} holePar={5} />);

        expect(getByTestId('score-editor-par-5')).toBeTruthy();
    });
});
