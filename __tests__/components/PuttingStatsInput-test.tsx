import { render, fireEvent } from '@testing-library/react-native';
import PuttingStatsInput from '../../components/PuttingStatsInput';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        holeScoreInput: {
            playerName: { fontSize: 16, fontWeight: 'bold' },
            stepperButtonText: { fontSize: 14 },
        },
    }),
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
    }),
}));

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

            const input = getByTestId('first-putt-input');
            expect(input.props.value).toBe('');
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

            const input = getByTestId('first-putt-input');
            expect(input.props.value).toBe('20');
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

            const input = getByTestId('first-putt-input');
            fireEvent.changeText(input, '25');

            expect(onStatsChange).toHaveBeenCalledWith(25, undefined, expect.any(Boolean));
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

            const input = getByTestId('first-putt-input');
            fireEvent.changeText(input, '');

            expect(onStatsChange).toHaveBeenCalledWith(undefined, undefined, expect.any(Boolean));
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
            expect(getByTestId('second-putt-input').props.value).toBe('');
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

            expect(getByTestId('second-putt-input').props.value).toBe('8');
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
            expect(getByTestId('second-putt-input').props.value).toBe('');
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

            expect(onStatsChange).toHaveBeenCalledWith(20, 5, true);
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
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '5');

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
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '5');

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
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '');

            // Should be called because blank is always allowed (means no second putt)
            expect(onStatsChange).toHaveBeenCalledWith(undefined, undefined, false);
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
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '0');

            // Should be called because 0 is always allowed (means no second putt)
            expect(onStatsChange).toHaveBeenCalledWith(undefined, 0, false);
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
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '0');

            expect(onStatsChange).toHaveBeenCalledWith(0, 0, false);
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

            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '5');

            expect(onStatsChange).toHaveBeenCalledWith(20, 5, false);
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
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '15');
            expect(onStatsChange).not.toHaveBeenCalled();
            expect(queryByTestId('second-putt-error')).toBeTruthy();

            onStatsChange.mockClear();

            // Try to set short 2nd putt to 10 (equal to 1st putt of 10)
            fireEvent.changeText(secondPuttInput, '10');
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

            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '10');

            expect(onStatsChange).toHaveBeenCalledWith(20, 10, false);
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
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '25');

            expect(onStatsChange).toHaveBeenCalledWith(10, 25, true);
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

            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '10');

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
            const secondPuttInput = getByTestId('second-putt-input');

            // First trigger the error
            fireEvent.changeText(secondPuttInput, '20');
            expect(queryByTestId('second-putt-error')).toBeTruthy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(true);

            onStatsChange.mockClear();
            onSecondPuttErrorChange.mockClear();

            // Then enter a valid value
            fireEvent.changeText(secondPuttInput, '10');
            expect(queryByTestId('second-putt-error')).toBeFalsy();
            expect(onSecondPuttErrorChange).toHaveBeenCalledWith(false);
            expect(onStatsChange).toHaveBeenCalledWith(20, 10, false);
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
            expect(onStatsChange).toHaveBeenCalledWith(10, 15, true);
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
        it('clamps first putt to max 300', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );

            onStatsChange.mockClear();

            const input = getByTestId('first-putt-input');
            fireEvent.changeText(input, '500');

            expect(onStatsChange).toHaveBeenCalledWith(300, undefined, expect.any(Boolean));
        });

        it('clamps first putt to min 0', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );

            onStatsChange.mockClear();

            const input = getByTestId('first-putt-input');
            fireEvent.changeText(input, '-5');

            expect(onStatsChange).toHaveBeenCalledWith(0, undefined, expect.any(Boolean));
        });
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
        it('displays (ft) for first and second putt regardless of units prop', () => {
            const onStatsChange = jest.fn();
            const { getByText } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    units="metres"
                />
            );

            expect(getByText('1st Putt (ft)')).toBeTruthy();
            expect(getByText('2nd Putt (ft)')).toBeTruthy();
        });

        it('displays (ft) for first and second putt when units prop is not provided', () => {
            const onStatsChange = jest.fn();
            const { getByText } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                />
            );

            expect(getByText('1st Putt (ft)')).toBeTruthy();
            expect(getByText('2nd Putt (ft)')).toBeTruthy();
        });
    });
});
