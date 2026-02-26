import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DeadlySinsTally from '../../components/DeadlySinsTally';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

describe('DeadlySinsTally component', () => {
    const mockOnEndRound = jest.fn();
    const mockOnRoundStateChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('idle state (no round active)', () => {
        it('renders Start round button initially', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            expect(getByTestId('7deadly-sins-start-round')).toBeTruthy();
        });

        it('does not show counters before round starts', () => {
            const { queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            expect(queryByTestId('7deadly-sins-count-three-putts')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-double-bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-bogeys-par5')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-bogeys-inside-9iron')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-double-chips')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-trouble-off-tee')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-penalties')).toBeNull();
        });

        it('does not show End round button initially', () => {
            const { queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            expect(queryByTestId('7deadly-sins-end-round')).toBeNull();
        });

    });

    describe('active state (round in progress)', () => {
        it('does not show total', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByTestId('7deadly-sins-total')).toBeNull();
        });

        it('shows counters and End round after pressing Start round', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByTestId('7deadly-sins-count-three-putts')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-count-double-bogeys')).toBeNull();
            expect(getByTestId('7deadly-sins-count-bogeys-inside-9iron')).toBeTruthy();
            expect(getByTestId('7deadly-sins-count-double-chips')).toBeTruthy();
            expect(getByTestId('7deadly-sins-count-trouble-off-tee')).toBeTruthy();
            expect(getByTestId('7deadly-sins-count-penalties')).toBeTruthy();
            expect(getByTestId('7deadly-sins-end-round')).toBeTruthy();
        });

        it('hides Start round button during active round', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByTestId('7deadly-sins-start-round')).toBeNull();
        });

        it('calls onRoundStateChange with true when starting round', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} onRoundStateChange={mockOnRoundStateChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(mockOnRoundStateChange).toHaveBeenCalledWith(true);
        });

        it('renders all seven labels and counters at 0 when round starts', () => {
            const { getByTestId, getByText } = render(<DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} userScore={7} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByText('Bogeys on par 5s')).toBeTruthy();
            expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
            expect(getByText('Double chips')).toBeTruthy();
            expect(getByText('Trouble off tee')).toBeTruthy();
            expect(getByText('Penalties')).toBeTruthy();

            expect(getByTestId('7deadly-sins-count-three-putts').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-double-bogeys').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-bogeys-par5').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-bogeys-inside-9iron').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-double-chips').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-trouble-off-tee').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-penalties').props.children).toBe(0);
        });

        it('increments three-putts counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-three-putts'));

            expect(getByTestId('7deadly-sins-count-three-putts').props.children).toBe(1);
        });

        it('increments double-bogeys counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} userScore={6} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));

            expect(getByTestId('7deadly-sins-count-double-bogeys').props.children).toBe(1);
        });

        it('increments bogeys-par5 counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-bogeys-par5'));

            expect(getByTestId('7deadly-sins-count-bogeys-par5').props.children).toBe(1);
        });

        it('increments bogeys-inside-9iron counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-bogeys-inside-9iron'));

            expect(getByTestId('7deadly-sins-count-bogeys-inside-9iron').props.children).toBe(1);
        });

        it('increments double-chips counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-chips'));

            expect(getByTestId('7deadly-sins-count-double-chips').props.children).toBe(1);
        });

        it('increments trouble-off-tee counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-trouble-off-tee'));

            expect(getByTestId('7deadly-sins-count-trouble-off-tee').props.children).toBe(1);
        });

        it('increments penalties counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-penalties'));

            expect(getByTestId('7deadly-sins-count-penalties').props.children).toBe(1);
        });

        it('decrements three-putts counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-increment-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-decrement-three-putts'));

            expect(getByTestId('7deadly-sins-count-three-putts').props.children).toBe(1);
        });

        it('does not decrement below 0', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-decrement-three-putts'));

            expect(getByTestId('7deadly-sins-count-three-putts').props.children).toBe(0);
        });

        it('multiple increments on same counter', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} userScore={6} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));

            expect(getByTestId('7deadly-sins-count-double-bogeys').props.children).toBe(3);
        });

    });

    describe('ending a round', () => {
        it('End round calls callback with correct values', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} userScore={7} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-increment-bogeys-inside-9iron'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-chips'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-chips'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-chips'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));
            fireEvent.press(getByTestId('7deadly-sins-increment-bogeys-par5'));
            fireEvent.press(getByTestId('7deadly-sins-increment-trouble-off-tee'));
            fireEvent.press(getByTestId('7deadly-sins-increment-penalties'));
            fireEvent.press(getByTestId('7deadly-sins-increment-penalties'));

            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(mockOnEndRound).toHaveBeenCalledWith(1, 2, 1, 1, 3, 2, 1);
        });

        it('End round with all zeros works', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(mockOnEndRound).toHaveBeenCalledWith(0, 0, 0, 0, 0, 0, 0);
        });

        it('counters reset to 0 after ending round', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} userScore={7} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-increment-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));
            fireEvent.press(getByTestId('7deadly-sins-increment-trouble-off-tee'));
            fireEvent.press(getByTestId('7deadly-sins-increment-penalties'));
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            // After ending, we're back to idle — start a new round to verify counters are 0
            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByTestId('7deadly-sins-count-three-putts').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-double-bogeys').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-bogeys-par5').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-bogeys-inside-9iron').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-double-chips').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-trouble-off-tee').props.children).toBe(0);
            expect(getByTestId('7deadly-sins-count-penalties').props.children).toBe(0);
        });

        it('returns to Start round state after ending round', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(getByTestId('7deadly-sins-start-round')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-end-round')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-three-putts')).toBeNull();
        });

        it('calls onRoundStateChange with false when ending round', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} onRoundStateChange={mockOnRoundStateChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            mockOnRoundStateChange.mockClear();
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(mockOnRoundStateChange).toHaveBeenCalledWith(false);
        });
    });

    describe('holePar conditional for bogeys on par 5s', () => {
        it('hides Bogeys on par 5s when holePar is not provided', () => {
            const { getByTestId, queryByText, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Bogeys on par 5s')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-bogeys-par5')).toBeNull();
        });

        it('hides Bogeys on par 5s when holePar is 4', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Bogeys on par 5s')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-bogeys-par5')).toBeNull();
        });

        it('shows Bogeys on par 5s when holePar is 5', () => {
            const { getByTestId, getByText } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('Bogeys on par 5s')).toBeTruthy();
            expect(getByTestId('7deadly-sins-count-bogeys-par5')).toBeTruthy();
        });

        it('still shows other categories when holePar is not 5', () => {
            const { getByTestId, getByText, queryByText } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
            expect(getByText('Double chips')).toBeTruthy();
            expect(getByText('Trouble off tee')).toBeTruthy();
            expect(getByText('Penalties')).toBeTruthy();
            expect(queryByText('Double bogeys')).toBeNull();
        });
    });

    describe('userScore conditional for double bogeys', () => {
        it('hides Double bogeys when userScore is less than 2 over par', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} userScore={5} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-double-bogeys')).toBeNull();
        });

        it('hides Double bogeys when userScore equals par', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} userScore={4} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-double-bogeys')).toBeNull();
        });

        it('shows Double bogeys when userScore is exactly 2 over par', () => {
            const { getByTestId, getByText } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByTestId('7deadly-sins-count-double-bogeys')).toBeTruthy();
        });

        it('shows Double bogeys when userScore is more than 2 over par', () => {
            const { getByTestId, getByText } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={3} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByTestId('7deadly-sins-count-double-bogeys')).toBeTruthy();
        });

        it('hides Double bogeys when userScore is not provided', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-double-bogeys')).toBeNull();
        });

        it('hides Double bogeys when holePar is not provided but userScore is', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-count-double-bogeys')).toBeNull();
        });
    });

    describe('open/close toggle', () => {
        it('shows toggle header when round is active', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByTestId('7deadly-sins-toggle')).toBeTruthy();
        });

        it('does not show toggle when round is not active', () => {
            const { queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            expect(queryByTestId('7deadly-sins-toggle')).toBeNull();
        });

        it('counters are open by default when round is active', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByTestId('7deadly-sins-count-three-putts')).toBeTruthy();
        });

        it('pressing toggle hides counter rows', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-toggle'));

            expect(queryByTestId('7deadly-sins-count-three-putts')).toBeNull();
        });

        it('pressing toggle again shows counter rows', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-toggle'));
            fireEvent.press(getByTestId('7deadly-sins-toggle'));

            expect(getByTestId('7deadly-sins-count-three-putts')).toBeTruthy();
        });

        it('shows toggle header in roundControlled mode', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} />
            );

            expect(getByTestId('7deadly-sins-toggle')).toBeTruthy();
        });

        it('pressing toggle hides counters in roundControlled mode', () => {
            const { getByTestId, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle'));

            expect(queryByTestId('7deadly-sins-count-three-putts')).toBeNull();
        });
    });

    describe('roundControlled mode', () => {
        const mockOnValuesChange = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('shows counters immediately without Start button', () => {
            const { getByTestId, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            expect(getByTestId('7deadly-sins-count-three-putts')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-count-double-bogeys')).toBeNull();
            expect(getByTestId('7deadly-sins-count-trouble-off-tee')).toBeTruthy();
            expect(getByTestId('7deadly-sins-count-penalties')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-start-round')).toBeNull();
        });

        it('does not show End round button', () => {
            const { queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            expect(queryByTestId('7deadly-sins-end-round')).toBeNull();
        });

        it('calls onValuesChange when counter changes', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-increment-three-putts'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(0, 0, 1, 0, 0, 0, 0);
        });

        it('calls onValuesChange with all updated values', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} holePar={4} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-increment-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-bogeys'));

            expect(mockOnValuesChange).toHaveBeenLastCalledWith(0, 0, 1, 0, 0, 1, 0);
        });

        it('increments and decrements work in roundControlled mode', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-increment-double-chips'));
            fireEvent.press(getByTestId('7deadly-sins-increment-double-chips'));
            fireEvent.press(getByTestId('7deadly-sins-decrement-double-chips'));

            expect(getByTestId('7deadly-sins-count-double-chips').props.children).toBe(1);
        });

        it('calls onValuesChange with trouble-off-tee updated', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-increment-trouble-off-tee'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(1, 0, 0, 0, 0, 0, 0);
        });

        it('calls onValuesChange with penalties updated', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-increment-penalties'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(0, 1, 0, 0, 0, 0, 0);
        });
    });
});
