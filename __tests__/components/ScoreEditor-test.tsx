import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScoreEditor from '../../components/ScoreEditor';

describe('ScoreEditor', () => {
    it('shows hole number and player name', () => {
        const { getByText } = render(
            <ScoreEditor holeNumber={3} playerName="Alice" score={5} onIncrement={jest.fn()} onDecrement={jest.fn()} />
        );

        expect(getByText('Hole 3 - Alice')).toBeTruthy();
    });

    it('shows current score', () => {
        const { getByTestId } = render(
            <ScoreEditor holeNumber={1} playerName="You" score={4} onIncrement={jest.fn()} onDecrement={jest.fn()} />
        );

        expect(getByTestId('score-editor-value')).toHaveTextContent('4');
    });

    it('calls onIncrement when + pressed', () => {
        const onIncrement = jest.fn();
        const { getByTestId } = render(
            <ScoreEditor holeNumber={1} playerName="You" score={4} onIncrement={onIncrement} onDecrement={jest.fn()} />
        );

        fireEvent.press(getByTestId('score-editor-increment'));

        expect(onIncrement).toHaveBeenCalled();
    });

    it('calls onDecrement when - pressed', () => {
        const onDecrement = jest.fn();
        const { getByTestId } = render(
            <ScoreEditor holeNumber={1} playerName="You" score={4} onIncrement={jest.fn()} onDecrement={onDecrement} />
        );

        fireEvent.press(getByTestId('score-editor-decrement'));

        expect(onDecrement).toHaveBeenCalled();
    });
});
