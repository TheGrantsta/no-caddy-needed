import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Tiger5Tally from '../../components/Tiger5Tally';

describe('Tiger5Tally component', () => {
    const mockOnSaveRound = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all five labels and counters at 0', () => {
        const { getByText, getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        expect(getByText('3-putts')).toBeTruthy();
        expect(getByText('Double bogeys')).toBeTruthy();
        expect(getByText('Bogeys on par 5s')).toBeTruthy();
        expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
        expect(getByText('Double chips')).toBeTruthy();

        expect(getByTestId('tiger5-count-three-putts').props.children).toBe(0);
        expect(getByTestId('tiger5-count-double-bogeys').props.children).toBe(0);
        expect(getByTestId('tiger5-count-bogeys-par5').props.children).toBe(0);
        expect(getByTestId('tiger5-count-bogeys-inside-9iron').props.children).toBe(0);
        expect(getByTestId('tiger5-count-double-chips').props.children).toBe(0);
    });

    it('renders total at 0 initially', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        expect(getByTestId('tiger5-total').props.children).toEqual(['Total: ', 0]);
    });

    it('increments three-putts counter', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-three-putts'));

        expect(getByTestId('tiger5-count-three-putts').props.children).toBe(1);
    });

    it('increments double-bogeys counter', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));

        expect(getByTestId('tiger5-count-double-bogeys').props.children).toBe(1);
    });

    it('increments bogeys-par5 counter', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-bogeys-par5'));

        expect(getByTestId('tiger5-count-bogeys-par5').props.children).toBe(1);
    });

    it('increments bogeys-inside-9iron counter', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-bogeys-inside-9iron'));

        expect(getByTestId('tiger5-count-bogeys-inside-9iron').props.children).toBe(1);
    });

    it('increments double-chips counter', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-double-chips'));

        expect(getByTestId('tiger5-count-double-chips').props.children).toBe(1);
    });

    it('decrements three-putts counter', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-three-putts'));
        fireEvent.press(getByTestId('tiger5-increment-three-putts'));
        fireEvent.press(getByTestId('tiger5-decrement-three-putts'));

        expect(getByTestId('tiger5-count-three-putts').props.children).toBe(1);
    });

    it('does not decrement below 0', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-decrement-three-putts'));

        expect(getByTestId('tiger5-count-three-putts').props.children).toBe(0);
    });

    it('multiple increments on same counter', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));

        expect(getByTestId('tiger5-count-double-bogeys').props.children).toBe(3);
    });

    it('total updates when any counter changes', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-three-putts'));
        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
        fireEvent.press(getByTestId('tiger5-increment-bogeys-par5'));
        fireEvent.press(getByTestId('tiger5-increment-bogeys-inside-9iron'));
        fireEvent.press(getByTestId('tiger5-increment-double-chips'));

        expect(getByTestId('tiger5-total').props.children).toEqual(['Total: ', 5]);
    });

    it('save calls callback with correct values', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-three-putts'));
        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
        fireEvent.press(getByTestId('tiger5-increment-bogeys-par5'));
        fireEvent.press(getByTestId('tiger5-increment-bogeys-inside-9iron'));
        fireEvent.press(getByTestId('tiger5-increment-double-chips'));
        fireEvent.press(getByTestId('tiger5-increment-double-chips'));
        fireEvent.press(getByTestId('tiger5-increment-double-chips'));

        fireEvent.press(getByTestId('tiger5-save-round'));

        expect(mockOnSaveRound).toHaveBeenCalledWith(1, 2, 1, 1, 3);
    });

    it('save with all zeros works', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-save-round'));

        expect(mockOnSaveRound).toHaveBeenCalledWith(0, 0, 0, 0, 0);
    });

    it('counters reset to 0 after save', () => {
        const { getByTestId } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        fireEvent.press(getByTestId('tiger5-increment-three-putts'));
        fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));

        fireEvent.press(getByTestId('tiger5-save-round'));

        expect(getByTestId('tiger5-count-three-putts').props.children).toBe(0);
        expect(getByTestId('tiger5-count-double-bogeys').props.children).toBe(0);
        expect(getByTestId('tiger5-count-bogeys-par5').props.children).toBe(0);
        expect(getByTestId('tiger5-count-bogeys-inside-9iron').props.children).toBe(0);
        expect(getByTestId('tiger5-count-double-chips').props.children).toBe(0);
        expect(getByTestId('tiger5-total').props.children).toEqual(['Total: ', 0]);
    });

    it('renders save round button', () => {
        const { getByText } = render(<Tiger5Tally onSaveRound={mockOnSaveRound} />);

        expect(getByText('Save round')).toBeTruthy();
    });
});
