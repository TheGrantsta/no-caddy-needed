import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HoleScoreInput from '../../components/HoleScoreInput';

describe('HoleScoreInput component', () => {
    const mockOnScore = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('displays the current hole number', () => {
        const { getByText } = render(
            <HoleScoreInput holeNumber={1} onScore={mockOnScore} />
        );

        expect(getByText('Hole 1')).toBeTruthy();
    });

    it('displays all score buttons', () => {
        const { getByTestId } = render(
            <HoleScoreInput holeNumber={1} onScore={mockOnScore} />
        );

        expect(getByTestId('score-button--2')).toBeTruthy();
        expect(getByTestId('score-button--1')).toBeTruthy();
        expect(getByTestId('score-button-0')).toBeTruthy();
        expect(getByTestId('score-button-1')).toBeTruthy();
        expect(getByTestId('score-button-2')).toBeTruthy();
    });

    it('displays correct labels for score buttons', () => {
        const { getByText } = render(
            <HoleScoreInput holeNumber={1} onScore={mockOnScore} />
        );

        expect(getByText('-2')).toBeTruthy();
        expect(getByText('-1')).toBeTruthy();
        expect(getByText('E')).toBeTruthy();
        expect(getByText('+1')).toBeTruthy();
        expect(getByText('+2')).toBeTruthy();
    });

    it('calls onScore with correct value when +1 is pressed', () => {
        const { getByTestId } = render(
            <HoleScoreInput holeNumber={5} onScore={mockOnScore} />
        );

        fireEvent.press(getByTestId('score-button-1'));

        expect(mockOnScore).toHaveBeenCalledWith(5, 1);
    });

    it('calls onScore with 0 when E is pressed', () => {
        const { getByTestId } = render(
            <HoleScoreInput holeNumber={3} onScore={mockOnScore} />
        );

        fireEvent.press(getByTestId('score-button-0'));

        expect(mockOnScore).toHaveBeenCalledWith(3, 0);
    });

    it('calls onScore with -1 when -1 is pressed', () => {
        const { getByTestId } = render(
            <HoleScoreInput holeNumber={7} onScore={mockOnScore} />
        );

        fireEvent.press(getByTestId('score-button--1'));

        expect(mockOnScore).toHaveBeenCalledWith(7, -1);
    });

    it('calls onScore with -2 when -2 is pressed', () => {
        const { getByTestId } = render(
            <HoleScoreInput holeNumber={2} onScore={mockOnScore} />
        );

        fireEvent.press(getByTestId('score-button--2'));

        expect(mockOnScore).toHaveBeenCalledWith(2, -2);
    });

    it('calls onScore with +2 when +2 is pressed', () => {
        const { getByTestId } = render(
            <HoleScoreInput holeNumber={18} onScore={mockOnScore} />
        );

        fireEvent.press(getByTestId('score-button-2'));

        expect(mockOnScore).toHaveBeenCalledWith(18, 2);
    });

    it('displays hole number for different holes', () => {
        const { getByText } = render(
            <HoleScoreInput holeNumber={14} onScore={mockOnScore} />
        );

        expect(getByText('Hole 14')).toBeTruthy();
    });
});
