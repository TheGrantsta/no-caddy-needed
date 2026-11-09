import { render, fireEvent } from '@testing-library/react-native';
import PuttingStatsInput from '../../components/PuttingStatsInput';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

// Opens a putt distance picker and chooses a value ('' clears it)
const choosePuttDistance = (getByTestId: (id: string) => any, id: string, value: string) => {
    fireEvent.press(getByTestId(id));
    fireEvent.press(getByTestId(value === '' ? `${id}-option-clear` : `${id}-option-${value}`));
};

describe('PuttingStatsInput', () => {
    describe('first putt input', () => {
        it('renders first putt input blank when no initial value given', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );
            expect(getByTestId('first-putt-input')).toHaveTextContent('0');
        });

        it('renders first putt input with provided initial value', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );
            expect(getByTestId('first-putt-input')).toHaveTextContent('20');
        });

        it('calls onStatsChange when first putt value changes', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            onStatsChange.mockClear();
            choosePuttDistance(getByTestId, 'first-putt-input', '25');

            expect(onStatsChange).toHaveBeenCalledWith(25, undefined, expect.any(Boolean), expect.any(Boolean));
        });

        it('calls onStatsChange with undefined when first putt field is cleared', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            onStatsChange.mockClear();
            choosePuttDistance(getByTestId, 'first-putt-input', '');

            expect(onStatsChange).toHaveBeenCalledWith(undefined, undefined, expect.any(Boolean), expect.any(Boolean));
        });
    });

    describe('second putt input', () => {
        it('shows second putt input immediately when no initialSecondPutt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            // No add button, input is always visible
            expect(queryByTestId('add-second-putt')).toBeFalsy();
            expect(getByTestId('second-putt-input')).toBeTruthy();
            expect(getByTestId('second-putt-input')).toHaveTextContent('0');
        });

        it('shows second putt with loaded saved data', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondPutt={8}
                />
            );

            expect(getByTestId('second-putt-input')).toHaveTextContent('8');
        });

        it('shows second putt immediately when 3-putt selected', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            expect(queryByTestId('add-second-putt')).toBeFalsy();
            expect(getByTestId('second-putt-input')).toBeTruthy();
            expect(getByTestId('second-putt-input')).toHaveTextContent('0');
        });
    });

    describe('second putt direction toggle', () => {
        it('shows toggle with Short selected by default', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            expect(getByTestId('second-putt-toggle-short')).toBeTruthy();
            expect(getByTestId('second-putt-toggle-long')).toBeTruthy();
        });

        it('calls onStatsChange when toggle changes to Long', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondPutt={5}
                    initialSecondIsLong={false}
                    initialThirdPutt={3}
                />
            );

            onStatsChange.mockClear();

            const longButton = getByTestId('second-putt-toggle-long');
            fireEvent.press(longButton);

            expect(onStatsChange).toHaveBeenCalledWith(20, 5, true, false);
        });
    });

    describe('cross-field validation', () => {
        it('does not update stats if second putt > 0 but first putt is empty', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );

            onStatsChange.mockClear();

            // Try to enter second putt without first putt
            choosePuttDistance(getByTestId, 'second-putt-input', '5');

            // onStatsChange should not be called because first putt is empty
            expect(onStatsChange).not.toHaveBeenCalled();
        });

        it('does not update stats if second putt > 0 but first putt is 0', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={0}
                />
            );

            onStatsChange.mockClear();

            // Try to enter second putt > 0 when first putt is 0
            choosePuttDistance(getByTestId, 'second-putt-input', '5');

            // onStatsChange should not be called because first putt is 0
            expect(onStatsChange).not.toHaveBeenCalled();
        });

        it('allows blank second putt even with empty first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );

            onStatsChange.mockClear();

            // Blank second putt means no second putt attempted
            choosePuttDistance(getByTestId, 'second-putt-input', '');

            // Should be called because blank is always allowed (means no second putt)
            expect(onStatsChange).toHaveBeenCalledWith(undefined, undefined, false, false);
        });

        it('allows second putt = 0 even with empty first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );

            onStatsChange.mockClear();

            // Second putt = 0 is allowed with empty first putt (explicit 0 means no second putt)
            choosePuttDistance(getByTestId, 'second-putt-input', '0');

            // Should be called because 0 is always allowed (means no second putt)
            expect(onStatsChange).toHaveBeenCalledWith(undefined, 0, false, false);
        });

        it('allows second putt = 0 even with first putt = 0', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={0}
                />
            );

            onStatsChange.mockClear();

            // Second putt = 0 is allowed with first putt = 0
            choosePuttDistance(getByTestId, 'second-putt-input', '0');

            expect(onStatsChange).toHaveBeenCalledWith(0, 0, false, false);
        });

        it('allows second putt > 0 when first putt is filled in', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            onStatsChange.mockClear();
            choosePuttDistance(getByTestId, 'second-putt-input', '5');

            expect(onStatsChange).toHaveBeenCalledWith(20, 5, false, false);
        });

        it('does not allow short second putt >= first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondIsLong={false}
                />
            );

            onStatsChange.mockClear();

            // Try to set short 2nd putt to 15 (bigger than 1st putt of 10)
            choosePuttDistance(getByTestId, 'second-putt-input', '15');
            expect(onStatsChange).not.toHaveBeenCalled();
            expect(queryByTestId('second-putt-error')).toBeTruthy();

            onStatsChange.mockClear();

            // Try to set short 2nd putt to 10 (equal to 1st putt of 10)
            choosePuttDistance(getByTestId, 'second-putt-input', '10');
            expect(onStatsChange).not.toHaveBeenCalled();
            expect(queryByTestId('second-putt-error')).toBeTruthy();
        });

        it('allows short second putt < first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondIsLong={false}
                />
            );

            onStatsChange.mockClear();
            choosePuttDistance(getByTestId, 'second-putt-input', '10');

            expect(onStatsChange).toHaveBeenCalledWith(20, 10, false, false);
        });

        it('allows long second putt > first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondIsLong={true}
                />
            );

            onStatsChange.mockClear();

            // Long putt can be bigger than first putt
            choosePuttDistance(getByTestId, 'second-putt-input', '25');

            expect(onStatsChange).toHaveBeenCalledWith(10, 25, true, false);
        });

        it('does not flip toggle to Short when second putt exceeds first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondPutt={15}
                    initialSecondIsLong={true}
                />
            );

            onStatsChange.mockClear();

            // Try to switch to Short when second putt (15) > first putt (10)
            const shortButton = getByTestId('second-putt-toggle-short');
            fireEvent.press(shortButton);

            // onStatsChange should not be called, toggle press has no effect
            expect(onStatsChange).not.toHaveBeenCalled();
            expect(queryByTestId('second-putt-error')).toBeTruthy();
        });

        it('does not flip toggle to Short when second putt equals first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondPutt={10}
                    initialSecondIsLong={true}
                />
            );

            onStatsChange.mockClear();

            // Try to switch to Short when second putt (10) == first putt (10)
            const shortButton = getByTestId('second-putt-toggle-short');
            fireEvent.press(shortButton);

            // onStatsChange should not be called, toggle press has no effect
            expect(onStatsChange).not.toHaveBeenCalled();
            expect(queryByTestId('second-putt-error')).toBeTruthy();
        });
    });

    describe('second putt error', () => {
        it('calls onSecondPuttErrorChange(false) on mount when no error', () => {
            const onStatsChange = jest.fn();
            const onSecondPuttErrorChange = jest.fn();
            render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    onSecondPuttErrorChange={onSecondPuttErrorChange}
                />
            );

            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(false);
        });

        it('calls onSecondPuttErrorChange(true) on mount when initial props have error', () => {
            const onStatsChange = jest.fn();
            const onSecondPuttErrorChange = jest.fn();
            render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondPutt={15}
                    initialSecondIsLong={false}
                    onSecondPuttErrorChange={onSecondPuttErrorChange}
                />
            );

            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(true);
        });

        it('hides second putt error by default', () => {
            const onStatsChange = jest.fn();
            const { queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            expect(queryByTestId('second-putt-error')).toBeFalsy();
        });

        it('shows error when short second putt >= first putt (input)', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondIsLong={false}
                />
            );

            onStatsChange.mockClear();
            choosePuttDistance(getByTestId, 'second-putt-input', '10');

            expect(queryByTestId('second-putt-error')).toBeTruthy();
            expect(onStatsChange).not.toHaveBeenCalled();
        });

        it('shows error when trying to switch toggle to Short with invalid value', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondPutt={10}
                    initialSecondIsLong={true}
                />
            );

            onStatsChange.mockClear();

            const shortButton = getByTestId('second-putt-toggle-short');
            fireEvent.press(shortButton);

            expect(queryByTestId('second-putt-error')).toBeTruthy();
            expect(onStatsChange).not.toHaveBeenCalled();
        });

        it('clears second putt error once a valid short value is entered', () => {
            const onStatsChange = jest.fn();
            const onSecondPuttErrorChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondIsLong={false}
                    onSecondPuttErrorChange={onSecondPuttErrorChange}
                />
            );

            onSecondPuttErrorChange.mockClear();

            // First trigger the error
            choosePuttDistance(getByTestId, 'second-putt-input', '20');
            expect(queryByTestId('second-putt-error')).toBeTruthy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(true);

            onStatsChange.mockClear();
            onSecondPuttErrorChange.mockClear();

            // Then enter a valid value
            choosePuttDistance(getByTestId, 'second-putt-input', '10');
            expect(queryByTestId('second-putt-error')).toBeFalsy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(false);
            expect(onStatsChange).toHaveBeenCalledWith(20, 10, false, false);
        });

        it('clears second putt error when first putt is increased to resolve it', () => {
            const onStatsChange = jest.fn();
            const onSecondPuttErrorChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={2}
                    initialSecondPutt={3}
                    initialSecondIsLong={false}
                    onSecondPuttErrorChange={onSecondPuttErrorChange}
                />
            );

            // Error should be showing because 3 >= 2 and Short
            expect(queryByTestId('second-putt-error')).toBeTruthy();
            onSecondPuttErrorChange.mockClear();
            onStatsChange.mockClear();

            // Increase first putt to 21 to resolve the error
            choosePuttDistance(getByTestId, 'first-putt-input', '21');

            // Error should be cleared and callbacks fired
            expect(queryByTestId('second-putt-error')).toBeFalsy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(false);
            expect(onStatsChange).toHaveBeenCalledWith(21, 3, false, false);
        });

        it('clears second putt error when first putt is cleared', () => {
            const onStatsChange = jest.fn();
            const onSecondPuttErrorChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={2}
                    initialSecondPutt={3}
                    initialSecondIsLong={false}
                    onSecondPuttErrorChange={onSecondPuttErrorChange}
                />
            );

            expect(queryByTestId('second-putt-error')).toBeTruthy();
            onSecondPuttErrorChange.mockClear();
            onStatsChange.mockClear();

            // Clear first putt field
            choosePuttDistance(getByTestId, 'first-putt-input', '');

            // Error should be cleared
            expect(queryByTestId('second-putt-error')).toBeFalsy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(false);
            expect(onStatsChange).toHaveBeenCalledWith(undefined, 3, false, false);
        });

        it('shows second putt error when first putt is lowered below second', () => {
            const onStatsChange = jest.fn();
            const onSecondPuttErrorChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondPutt={10}
                    initialSecondIsLong={false}
                    onSecondPuttErrorChange={onSecondPuttErrorChange}
                />
            );

            // No error should be showing (10 < 20)
            expect(queryByTestId('second-putt-error')).toBeFalsy();
            onSecondPuttErrorChange.mockClear();
            onStatsChange.mockClear();

            // Lower first putt to 5, making 10 > 5
            choosePuttDistance(getByTestId, 'first-putt-input', '5');

            // Error should now be showing
            expect(queryByTestId('second-putt-error')).toBeTruthy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(true);
        });

        it('clears second putt error when switching to Long', () => {
            const onStatsChange = jest.fn();
            const { getByTestId, queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondPutt={15}
                    initialSecondIsLong={false}
                />
            );

            // Error should be showing because 15 >= 10 and Short
            expect(queryByTestId('second-putt-error')).toBeTruthy();

            onStatsChange.mockClear();

            // Switch to Long to clear the error
            const longButton = getByTestId('second-putt-toggle-long');
            fireEvent.press(longButton);

            expect(queryByTestId('second-putt-error')).toBeFalsy();
            expect(onStatsChange).toHaveBeenCalledWith(10, 15, true, false);
        });
    });

    describe('3-putt indicator', () => {
        it('hides indicator when threePuttSelected is false', () => {
            const onStatsChange = jest.fn();
            const { queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            expect(queryByTestId('three-putt-indicator')).toBeFalsy();
        });

        it('shows indicator when threePuttSelected is true', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            const indicator = getByTestId('three-putt-indicator');
            expect(indicator).toBeTruthy();
            expect(indicator.props.children).toBe('3-putt');
        });
    });

    describe('required second putt error', () => {
        it('hides required error by default', () => {
            const onStatsChange = jest.fn();
            const { queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            expect(queryByTestId('second-putt-required-error')).toBeFalsy();
        });

        it('shows required error when showSecondPuttRequiredError is true', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    showSecondPuttRequiredError={true}
                />
            );

            expect(getByTestId('second-putt-required-error')).toBeTruthy();
        });
    });


    describe('input validation', () => {
    });

    describe('error display', () => {
        it('hides error text by default', () => {
            const onStatsChange = jest.fn();
            const { queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );

            expect(queryByTestId('first-putt-error')).toBeFalsy();
        });

        it('shows error text when showFirstPuttError is true', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    showFirstPuttError={true}
                />
            );

            expect(getByTestId('first-putt-error')).toBeTruthy();
        });
    });

    describe('unit labels', () => {
    });

    describe('error styling', () => {
    });

    describe('distance list cap', () => {
        it('shouldCapTheFirstPuttListAt100Feet', () => {
            const { getByTestId, queryByTestId } = render(<PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />);
            fireEvent.press(getByTestId('first-putt-input'));

            expect(getByTestId('first-putt-input-option-100')).toBeTruthy();
            expect(queryByTestId('first-putt-input-option-101')).toBeNull();
        });
    });

    describe('putting card layout matches the hole screen', () => {
        it('shouldLabelTheRowsAs1stPuttAnd2ndPutt', () => {
            const { getByText } = render(<PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />);

            expect(getByText('1st putt')).toBeTruthy();
            expect(getByText('2nd putt')).toBeTruthy();
        });

        it('shouldShowAFtUnitBesideEachPuttBox', () => {
            const { getAllByText } = render(<PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />);

            expect(getAllByText('ft')).toHaveLength(2);
        });

        it('shouldShowGreenInRegulationAsASwitchInsteadOfYesNoButtons', () => {
            const { getByTestId, queryByTestId } = render(<PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />);

            expect(getByTestId('gir-switch').props.value).toBe(false);
            expect(queryByTestId('gir-toggle-yes')).toBeNull();
            expect(queryByTestId('gir-toggle-no')).toBeNull();
        });

        it('shouldEmitGreenInRegulationWhenTheSwitchChanges', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(<PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} />);

            fireEvent(getByTestId('gir-switch'), 'valueChange', true);

            expect(onStatsChange).toHaveBeenLastCalledWith(undefined, undefined, false, true);
        });

        it('shouldUseBorderlessGreyBoxesForPuttDistances', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(<PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />);

            const style = StyleSheet.flatten(getByTestId('first-putt-input').props.style);
            expect(style.borderWidth ?? 0).toBe(0);
            expect(style.backgroundColor).toBeDefined();
        });
    });

    describe('green in regulation toggle', () => {
        it('shouldDefaultGreenInRegulationToNoWhenNoInitialValueGiven', () => {
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />
            );

            expect(getByTestId('gir-switch').props.value).toBe(false);
            expect(getByTestId('gir-switch').props.value).toBe(false);
        });

        it('shouldShowYesSelectedWhenInitialGreenInRegulationIsTrue', () => {
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} initialGreenInRegulation={true} />
            );

            expect(getByTestId('gir-switch').props.value).toBe(true);
            expect(getByTestId('gir-switch').props.value).toBe(true);
        });

        it('shouldEmitGreenInRegulationTrueWhenYesPressed', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} />
            );

            fireEvent(getByTestId('gir-switch'), 'valueChange', true);

            expect(onStatsChange).toHaveBeenLastCalledWith(undefined, undefined, false, true);
            expect(getByTestId('gir-switch').props.value).toBe(true);
        });

        it('shouldEmitGreenInRegulationFalseWhenSwitchedBackToNo', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} initialGreenInRegulation={true} />
            );

            fireEvent(getByTestId('gir-switch'), 'valueChange', false);

            expect(onStatsChange).toHaveBeenLastCalledWith(undefined, undefined, false, false);
        });

        it('shouldKeepGreenInRegulationWhenFirstPuttChanges', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} initialGreenInRegulation={true} />
            );

            choosePuttDistance(getByTestId, 'first-putt-input', '20');

            expect(onStatsChange).toHaveBeenLastCalledWith(20, undefined, false, true);
        });

        it('shouldKeepGreenInRegulationWhenSecondPuttChanges', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} initialFirstPutt={20} initialGreenInRegulation={true} />
            );

            choosePuttDistance(getByTestId, 'second-putt-input', '3');

            expect(onStatsChange).toHaveBeenLastCalledWith(20, 3, false, true);
        });

        it('shouldKeepGreenInRegulationWhenFirstPuttCleared', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} initialFirstPutt={20} initialGreenInRegulation={true} />
            );

            choosePuttDistance(getByTestId, 'first-putt-input', '');

            expect(onStatsChange).toHaveBeenLastCalledWith(undefined, undefined, false, true);
        });

        it('shouldKeepGreenInRegulationWhenPuttDirectionToggled', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} initialFirstPutt={20} initialSecondPutt={3} initialGreenInRegulation={true} />
            );

            fireEvent.press(getByTestId('second-putt-toggle-long'));

            expect(onStatsChange).toHaveBeenLastCalledWith(20, 3, true, true);
        });

        describe('auto-default when two putts and score equals par', () => {
            it('shouldDefaultGreenInRegulationToYesWhenTwoPuttsEnteredAndScoreEqualsPar', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} userScore={4} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                choosePuttDistance(getByTestId, 'first-putt-input', '20');
                choosePuttDistance(getByTestId, 'second-putt-input', '3');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, 3, false, true);
                expect(getByTestId('gir-switch').props.value).toBe(true);
            });

            it('shouldTreatHoledSecondPuttOfZeroAsTwoPutts', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={3} userScore={3} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                choosePuttDistance(getByTestId, 'first-putt-input', '2');
                choosePuttDistance(getByTestId, 'second-putt-input', '0');

                expect(onStatsChange).toHaveBeenLastCalledWith(2, 0, false, true);
            });

            it('shouldKeepGreenInRegulationFalseWhenScoreIsBogeyOnPar4', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} userScore={5} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                choosePuttDistance(getByTestId, 'first-putt-input', '20');
                choosePuttDistance(getByTestId, 'second-putt-input', '3');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, 3, false, false);
                expect(getByTestId('gir-switch').props.value).toBe(false);
            });

            it('shouldKeepGreenInRegulationFalseWhenScoreIsBirdie', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} userScore={3} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                choosePuttDistance(getByTestId, 'first-putt-input', '20');
                choosePuttDistance(getByTestId, 'second-putt-input', '3');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, 3, false, false);
            });

            it('shouldKeepGreenInRegulationFalseWhenOnlyFirstPuttEntered', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} userScore={4} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                choosePuttDistance(getByTestId, 'first-putt-input', '20');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, undefined, false, false);
            });

            it('shouldRevertGreenInRegulationToNoWhenSecondPuttCleared', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} userScore={4} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                choosePuttDistance(getByTestId, 'first-putt-input', '20');
                choosePuttDistance(getByTestId, 'second-putt-input', '3');
                choosePuttDistance(getByTestId, 'second-putt-input', '');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, undefined, false, false);
                expect(getByTestId('gir-switch').props.value).toBe(false);
            });

            it('shouldKeepManuallySelectedNoWhenPuttsWouldOtherwiseDefaultToYes', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} userScore={4} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                choosePuttDistance(getByTestId, 'first-putt-input', '20');
                fireEvent(getByTestId('gir-switch'), 'valueChange', false);
                choosePuttDistance(getByTestId, 'second-putt-input', '3');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, 3, false, false);
                expect(getByTestId('gir-switch').props.value).toBe(false);
            });

            it('shouldKeepManuallySelectedYesWhenScoreIsNotPar', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} userScore={5} threePuttSelected={false} onStatsChange={onStatsChange} />
                );

                fireEvent(getByTestId('gir-switch'), 'valueChange', true);
                choosePuttDistance(getByTestId, 'first-putt-input', '20');
                choosePuttDistance(getByTestId, 'second-putt-input', '3');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, 3, false, true);
                expect(getByTestId('gir-switch').props.value).toBe(true);
            });

            it('shouldNotOverrideSavedGreenInRegulationWhenUserScoreUnknown', () => {
                const onStatsChange = jest.fn();
                const { getByTestId } = render(
                    <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={onStatsChange} initialFirstPutt={20} initialSecondPutt={3} initialGreenInRegulation={true} />
                );

                choosePuttDistance(getByTestId, 'second-putt-input', '2');

                expect(onStatsChange).toHaveBeenLastCalledWith(20, 2, false, true);
            });
        });
    });

    describe('green in regulation layout', () => {
        const collectTestIds = (node: any, acc: string[] = []): string[] => {
            if (!node || typeof node !== 'object') return acc;
            if (Array.isArray(node)) {
                node.forEach(child => collectTestIds(child, acc));
                return acc;
            }
            if (node.props?.testID) acc.push(node.props.testID);
            collectTestIds(node.children, acc);
            return acc;
        };

        it('shouldRenderGreenInRegulationBelowSecondPutt', () => {
            const { toJSON } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />
            );

            const ids = collectTestIds(toJSON());
            expect(ids.indexOf('gir-switch')).toBeGreaterThan(ids.indexOf('second-putt-toggle-long'));
        });

        it('shouldRenderGreenInRegulationLabelInlineWithToggle', () => {
            const { toJSON } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />
            );

            const findRowContaining = (node: any, testID: string): any => {
                if (!node || typeof node !== 'object') return null;
                if (Array.isArray(node)) {
                    for (const child of node) {
                        const found = findRowContaining(child, testID);
                        if (found) return found;
                    }
                    return null;
                }
                const children = Array.isArray(node.children) ? node.children : [];
                if (children.some((child: any) => child?.props?.testID === testID)) return node;
                return findRowContaining(node.children, testID);
            };

            const row = findRowContaining(toJSON(), 'gir-label');
            const flatStyle = Object.assign({}, ...[row?.props.style].flat(Infinity).filter(Boolean));
            expect(flatStyle.flexDirection).toBe('row');
            expect(row.children).toHaveLength(2);
        });
    });

    describe('green in regulation label', () => {
        it('shouldLabelGreenInRegulationWithoutQuestionMark', () => {
            const { getByTestId } = render(
                <PuttingStatsInput holePar={4} threePuttSelected={false} onStatsChange={jest.fn()} />
            );

            expect(getByTestId('gir-label').props.children).toBe('Green in regulation');
        });
    });

    describe('green in regulation toggle sizing', () => {
    });

    describe('toggle text size', () => {
    });
});
