import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Tiger5Tally from '../../components/Tiger5Tally';

describe('Tiger5Tally component', () => {
    const mockOnEndRound = jest.fn();
    const mockOnRoundStateChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('idle state (no round active)', () => {
        it('renders Start round button initially', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            expect(getByTestId('tiger5-start-round')).toBeTruthy();
        });

        it('does not show counters before round starts', () => {
            const { queryByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            expect(queryByTestId('tiger5-count-three-putts')).toBeNull();
            expect(queryByTestId('tiger5-count-double-bogeys')).toBeNull();
            expect(queryByTestId('tiger5-count-bogeys-par5')).toBeNull();
            expect(queryByTestId('tiger5-count-bogeys-inside-9iron')).toBeNull();
            expect(queryByTestId('tiger5-count-double-chips')).toBeNull();
        });

        it('does not show End round button initially', () => {
            const { queryByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            expect(queryByTestId('tiger5-end-round')).toBeNull();
        });

});

    describe('active state (round in progress)', () => {
        it('does not show total', () => {
            const { getByTestId, queryByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(queryByTestId('tiger5-total')).toBeNull();
        });

        it('shows counters and End round after pressing Start round', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(getByTestId('tiger5-count-three-putts')).toBeTruthy();
            expect(getByTestId('tiger5-count-double-bogeys')).toBeTruthy();
            expect(getByTestId('tiger5-count-bogeys-inside-9iron')).toBeTruthy();
            expect(getByTestId('tiger5-count-double-chips')).toBeTruthy();
            expect(getByTestId('tiger5-end-round')).toBeTruthy();
        });

        it('hides Start round button during active round', () => {
            const { getByTestId, queryByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(queryByTestId('tiger5-start-round')).toBeNull();
        });

        it('calls onRoundStateChange with true when starting round', () => {
            const { getByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} onRoundStateChange={mockOnRoundStateChange} />
            );

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(mockOnRoundStateChange).toHaveBeenCalledWith(true);
        });

        it('renders all five labels and counters at 0 when round starts', () => {
            const { getByTestId, getByText } = render(<Tiger5Tally onEndRound={mockOnEndRound} holePar={5} />);

            fireEvent.press(getByTestId('tiger5-start-round'));

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

        it('increments three-putts counter', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-three-putts'));

            expect(getByTestId('tiger5-count-three-putts').props.children).toBe(1);
        });

        it('increments double-bogeys counter', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));

            expect(getByTestId('tiger5-count-double-bogeys').props.children).toBe(1);
        });

        it('increments bogeys-par5 counter', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} holePar={5} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-bogeys-par5'));

            expect(getByTestId('tiger5-count-bogeys-par5').props.children).toBe(1);
        });

        it('increments bogeys-inside-9iron counter', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-bogeys-inside-9iron'));

            expect(getByTestId('tiger5-count-bogeys-inside-9iron').props.children).toBe(1);
        });

        it('increments double-chips counter', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-double-chips'));

            expect(getByTestId('tiger5-count-double-chips').props.children).toBe(1);
        });

        it('decrements three-putts counter', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-three-putts'));
            fireEvent.press(getByTestId('tiger5-increment-three-putts'));
            fireEvent.press(getByTestId('tiger5-decrement-three-putts'));

            expect(getByTestId('tiger5-count-three-putts').props.children).toBe(1);
        });

        it('does not decrement below 0', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-decrement-three-putts'));

            expect(getByTestId('tiger5-count-three-putts').props.children).toBe(0);
        });

        it('multiple increments on same counter', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));

            expect(getByTestId('tiger5-count-double-bogeys').props.children).toBe(3);
        });

});

    describe('ending a round', () => {
        it('End round calls callback with correct values', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} holePar={5} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-three-putts'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
            fireEvent.press(getByTestId('tiger5-increment-bogeys-par5'));
            fireEvent.press(getByTestId('tiger5-increment-bogeys-inside-9iron'));
            fireEvent.press(getByTestId('tiger5-increment-double-chips'));
            fireEvent.press(getByTestId('tiger5-increment-double-chips'));
            fireEvent.press(getByTestId('tiger5-increment-double-chips'));

            fireEvent.press(getByTestId('tiger5-end-round'));

            expect(mockOnEndRound).toHaveBeenCalledWith(1, 2, 1, 1, 3);
        });

        it('End round with all zeros works', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-end-round'));

            expect(mockOnEndRound).toHaveBeenCalledWith(0, 0, 0, 0, 0);
        });

        it('counters reset to 0 after ending round', () => {
            const { getByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} holePar={5} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-increment-three-putts'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));
            fireEvent.press(getByTestId('tiger5-end-round'));

            // After ending, we're back to idle — start a new round to verify counters are 0
            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(getByTestId('tiger5-count-three-putts').props.children).toBe(0);
            expect(getByTestId('tiger5-count-double-bogeys').props.children).toBe(0);
            expect(getByTestId('tiger5-count-bogeys-par5').props.children).toBe(0);
            expect(getByTestId('tiger5-count-bogeys-inside-9iron').props.children).toBe(0);
            expect(getByTestId('tiger5-count-double-chips').props.children).toBe(0);
        });

        it('returns to Start round state after ending round', () => {
            const { getByTestId, queryByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));
            fireEvent.press(getByTestId('tiger5-end-round'));

            expect(getByTestId('tiger5-start-round')).toBeTruthy();
            expect(queryByTestId('tiger5-end-round')).toBeNull();
            expect(queryByTestId('tiger5-count-three-putts')).toBeNull();
        });

        it('calls onRoundStateChange with false when ending round', () => {
            const { getByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} onRoundStateChange={mockOnRoundStateChange} />
            );

            fireEvent.press(getByTestId('tiger5-start-round'));
            mockOnRoundStateChange.mockClear();
            fireEvent.press(getByTestId('tiger5-end-round'));

            expect(mockOnRoundStateChange).toHaveBeenCalledWith(false);
        });
    });

    describe('holePar conditional for bogeys on par 5s', () => {
        it('hides Bogeys on par 5s when holePar is not provided', () => {
            const { getByTestId, queryByText, queryByTestId } = render(<Tiger5Tally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(queryByText('Bogeys on par 5s')).toBeNull();
            expect(queryByTestId('tiger5-count-bogeys-par5')).toBeNull();
        });

        it('hides Bogeys on par 5s when holePar is 4', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} holePar={4} />
            );

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(queryByText('Bogeys on par 5s')).toBeNull();
            expect(queryByTestId('tiger5-count-bogeys-par5')).toBeNull();
        });

        it('shows Bogeys on par 5s when holePar is 5', () => {
            const { getByTestId, getByText } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} holePar={5} />
            );

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(getByText('Bogeys on par 5s')).toBeTruthy();
            expect(getByTestId('tiger5-count-bogeys-par5')).toBeTruthy();
        });

        it('still shows other 4 categories when holePar is not 5', () => {
            const { getByTestId, getByText } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} holePar={4} />
            );

            fireEvent.press(getByTestId('tiger5-start-round'));

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
            expect(getByText('Double chips')).toBeTruthy();
        });
    });

    describe('roundControlled mode', () => {
        const mockOnValuesChange = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('shows counters immediately without Start button', () => {
            const { getByTestId, queryByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            expect(getByTestId('tiger5-count-three-putts')).toBeTruthy();
            expect(getByTestId('tiger5-count-double-bogeys')).toBeTruthy();
            expect(queryByTestId('tiger5-start-round')).toBeNull();
        });

        it('does not show End round button', () => {
            const { queryByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            expect(queryByTestId('tiger5-end-round')).toBeNull();
        });

        it('calls onValuesChange when counter changes', () => {
            const { getByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('tiger5-increment-three-putts'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(1, 0, 0, 0, 0);
        });

        it('calls onValuesChange with all updated values', () => {
            const { getByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('tiger5-increment-three-putts'));
            fireEvent.press(getByTestId('tiger5-increment-double-bogeys'));

            expect(mockOnValuesChange).toHaveBeenLastCalledWith(1, 1, 0, 0, 0);
        });

        it('increments and decrements work in roundControlled mode', () => {
            const { getByTestId } = render(
                <Tiger5Tally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('tiger5-increment-double-chips'));
            fireEvent.press(getByTestId('tiger5-increment-double-chips'));
            fireEvent.press(getByTestId('tiger5-decrement-double-chips'));

            expect(getByTestId('tiger5-count-double-chips').props.children).toBe(1);
        });
    });
});
