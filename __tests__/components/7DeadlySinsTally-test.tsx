import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import DeadlySinsTally from '../../components/DeadlySinsTally';
import { DeadlySinsValues } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const allFalse: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

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

        it('does not show toggle buttons before round starts', () => {
            const { queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            expect(queryByTestId('7deadly-sins-toggle-three-putts')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-double-bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-bogeys-par5')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-bogeys-inside-9iron')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-double-chips')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-trouble-off-tee')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-penalties')).toBeNull();
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

        it('shows toggle buttons and End round after pressing Start round', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-toggle-double-bogeys')).toBeNull();
            expect(getByTestId('7deadly-sins-toggle-bogeys-inside-9iron')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-double-chips')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-trouble-off-tee')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-penalties')).toBeTruthy();
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

        it('renders all seven labels and toggles when round starts', () => {
            const { getByTestId, getByText } = render(<DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} userScore={7} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByText('Bogeys on par 5s')).toBeTruthy();
            expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
            expect(getByText('Double chips')).toBeTruthy();
            expect(getByText('Trouble off tee')).toBeTruthy();
            expect(getByText('Penalties')).toBeTruthy();

            expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-double-bogeys')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-bogeys-par5')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-bogeys-inside-9iron')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-double-chips')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-trouble-off-tee')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-penalties')).toBeTruthy();
        });

        it('toggles three-putts to true when pressed', () => {
            const mockOnValuesChange = jest.fn();
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ threePutts: true }));
        });

        it('toggles three-putts back to false when pressed twice', () => {
            const mockOnValuesChange = jest.fn();
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));

            expect(mockOnValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ threePutts: false }));
        });

        it('toggles double-bogeys when holePar and userScore allow it', () => {
            const mockOnValuesChange = jest.fn();
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} holePar={4} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-double-bogeys'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ doubleBogeys: true }));
        });

        it('toggles bogeys-par5 when holePar is 5', () => {
            const mockOnValuesChange = jest.fn();
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} holePar={5} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-bogeys-par5'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ bogeysPar5: true }));
        });

        it('toggling one sin does not affect others', () => {
            const mockOnValuesChange = jest.fn();
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));

            expect(mockOnValuesChange).toHaveBeenCalledWith({
                threePutts: true,
                doubleBogeys: false,
                bogeysPar5: false,
                bogeysInside9Iron: false,
                doubleChips: false,
                troubleOffTee: false,
                penalties: false,
            });
        });

        it('toggling multiple sins accumulates correctly', () => {
            const mockOnValuesChange = jest.fn();
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} holePar={4} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-toggle-double-bogeys'));

            expect(mockOnValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({
                threePutts: true,
                doubleBogeys: true,
            }));
        });

        it('toggle button has secondary background when value is false', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} roundControlled />);

            const button = getByTestId('7deadly-sins-toggle-three-putts');
            const style = StyleSheet.flatten(button.props.style);
            expect(style.backgroundColor).toBe('#2D5A3D'); // c.primary
        });

        it('toggle button has primary background when value is true', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} roundControlled />);

            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));

            const button = getByTestId('7deadly-sins-toggle-three-putts');
            const style = StyleSheet.flatten(button.props.style);
            expect(style.backgroundColor).toBe('#2D5A3D'); // c.primary
        });
    });

    describe('ending a round', () => {
        it('End round calls callback with correct values object', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} userScore={7} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-toggle-bogeys-par5'));
            fireEvent.press(getByTestId('7deadly-sins-toggle-trouble-off-tee'));
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(mockOnEndRound).toHaveBeenCalledWith({
                threePutts: true,
                doubleBogeys: false,
                bogeysPar5: true,
                bogeysInside9Iron: false,
                doubleChips: false,
                troubleOffTee: true,
                penalties: false,
            });
        });

        it('End round with all false works', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(mockOnEndRound).toHaveBeenCalledWith(allFalse);
        });

        it('values reset to false after ending round', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            // Start a new round and end it immediately — all values must be false
            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            mockOnEndRound.mockClear();
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(mockOnEndRound).toHaveBeenCalledWith(allFalse);
        });

        it('returns to Start round state after ending round', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-end-round'));

            expect(getByTestId('7deadly-sins-start-round')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-end-round')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-three-putts')).toBeNull();
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
            expect(queryByTestId('7deadly-sins-toggle-bogeys-par5')).toBeNull();
        });

        it('hides Bogeys on par 5s when holePar is 4', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Bogeys on par 5s')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-bogeys-par5')).toBeNull();
        });

        it('shows Bogeys on par 5s when holePar is 5', () => {
            const { getByTestId, getByText } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={5} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('Bogeys on par 5s')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-bogeys-par5')).toBeTruthy();
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
            expect(queryByTestId('7deadly-sins-toggle-double-bogeys')).toBeNull();
        });

        it('hides Double bogeys when userScore equals par', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} userScore={4} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-double-bogeys')).toBeNull();
        });

        it('shows Double bogeys when userScore is exactly 2 over par', () => {
            const { getByTestId, getByText } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-double-bogeys')).toBeTruthy();
        });

        it('shows Double bogeys when userScore is more than 2 over par', () => {
            const { getByTestId, getByText } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={3} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-double-bogeys')).toBeTruthy();
        });

        it('hides Double bogeys when userScore is not provided', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} holePar={4} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-double-bogeys')).toBeNull();
        });

        it('hides Double bogeys when holePar is not provided but userScore is', () => {
            const { getByTestId, queryByText, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} userScore={6} />
            );

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByTestId('7deadly-sins-toggle-double-bogeys')).toBeNull();
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

        it('sin toggles are visible by default when round is active', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));

            expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy();
        });

        it('pressing header toggle hides sin rows', () => {
            const { getByTestId, queryByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-toggle'));

            expect(queryByTestId('7deadly-sins-toggle-three-putts')).toBeNull();
        });

        it('pressing header toggle again shows sin rows', () => {
            const { getByTestId } = render(<DeadlySinsTally onEndRound={mockOnEndRound} />);

            fireEvent.press(getByTestId('7deadly-sins-start-round'));
            fireEvent.press(getByTestId('7deadly-sins-toggle'));
            fireEvent.press(getByTestId('7deadly-sins-toggle'));

            expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy();
        });

        it('shows toggle header in roundControlled mode', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} />
            );

            expect(getByTestId('7deadly-sins-toggle')).toBeTruthy();
        });

        it('pressing header toggle hides sins in roundControlled mode', () => {
            const { getByTestId, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle'));

            expect(queryByTestId('7deadly-sins-toggle-three-putts')).toBeNull();
        });
    });

    describe('roundControlled mode', () => {
        const mockOnValuesChange = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('shows toggle buttons immediately without Start button', () => {
            const { getByTestId, queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-toggle-double-bogeys')).toBeNull();
            expect(getByTestId('7deadly-sins-toggle-trouble-off-tee')).toBeTruthy();
            expect(getByTestId('7deadly-sins-toggle-penalties')).toBeTruthy();
            expect(queryByTestId('7deadly-sins-start-round')).toBeNull();
        });

        it('does not show End round button', () => {
            const { queryByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            expect(queryByTestId('7deadly-sins-end-round')).toBeNull();
        });

        it('calls onValuesChange with object when toggle is pressed', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));

            expect(mockOnValuesChange).toHaveBeenCalledWith({
                threePutts: true,
                doubleBogeys: false,
                bogeysPar5: false,
                bogeysInside9Iron: false,
                doubleChips: false,
                troubleOffTee: false,
                penalties: false,
            });
        });

        it('calls onValuesChange with trouble-off-tee updated', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-trouble-off-tee'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ troubleOffTee: true }));
        });

        it('calls onValuesChange with penalties updated', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-penalties'));

            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ penalties: true }));
        });

        it('toggling twice reverts to false', () => {
            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            fireEvent.press(getByTestId('7deadly-sins-toggle-double-chips'));
            fireEvent.press(getByTestId('7deadly-sins-toggle-double-chips'));

            expect(mockOnValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ doubleChips: false }));
        });
    });

    describe('initialValues prop restores state', () => {
        it('uses initialValues booleans when roundControlled and initialValues provided', () => {
            const mockOnValuesChange = jest.fn();
            const initialValues: Partial<DeadlySinsValues> = { threePutts: true, troubleOffTee: true };

            const { getByTestId } = render(
                <DeadlySinsTally
                    onEndRound={mockOnEndRound}
                    roundControlled={true}
                    onValuesChange={mockOnValuesChange}
                    initialValues={initialValues}
                />
            );

            // threePutts was true → pressing flips to false
            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ threePutts: false }));
        });

        it('increments correctly from initialValues true', () => {
            const mockOnValuesChange = jest.fn();
            const initialValues: Partial<DeadlySinsValues> = { threePutts: true };

            const { getByTestId } = render(
                <DeadlySinsTally
                    onEndRound={mockOnEndRound}
                    roundControlled={true}
                    onValuesChange={mockOnValuesChange}
                    initialValues={initialValues}
                />
            );

            // pressing again flips to false, then true
            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ threePutts: false }));
            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ threePutts: true }));
        });

        it('defaults to false when initialValues not provided', () => {
            const mockOnValuesChange = jest.fn();

            const { getByTestId } = render(
                <DeadlySinsTally onEndRound={mockOnEndRound} roundControlled={true} onValuesChange={mockOnValuesChange} />
            );

            // pressing should go from false → true
            fireEvent.press(getByTestId('7deadly-sins-toggle-three-putts'));
            expect(mockOnValuesChange).toHaveBeenCalledWith(expect.objectContaining({ threePutts: true }));
        });
    });
});
