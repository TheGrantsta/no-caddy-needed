import { render, fireEvent, getByTestId } from '@testing-library/react-native';
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

            expect(onStatsChange).toHaveBeenCalledWith(25, expect.any(Number), expect.any(Boolean), undefined, undefined);
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

            expect(onStatsChange).toHaveBeenCalledWith(undefined, expect.any(Number), expect.any(Boolean), undefined, undefined);
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
            expect(getByTestId('second-putt-input').props.value).toBe('0');
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
            expect(getByTestId('second-putt-input').props.value).toBe('0');
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

            expect(onStatsChange).toHaveBeenCalledWith(
                20,
                5,
                true, // secondIsLong is now true
                3,
                expect.any(Boolean)
            );
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

            // Second putt = 0 is allowed with empty first putt (just means no second putt)
            const secondPuttInput = getByTestId('second-putt-input');
            fireEvent.changeText(secondPuttInput, '0');

            // Should be called because 0 is always allowed (means no second putt)
            expect(onStatsChange).toHaveBeenCalledWith(undefined, 0, false, undefined, undefined);
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

            expect(onStatsChange).toHaveBeenCalledWith(0, 0, false, undefined, undefined);
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

            expect(onStatsChange).toHaveBeenCalledWith(20, 5, false, undefined, undefined);
        });

        it('does not allow short second putt > first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
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
        });

        it('allows short second putt <= first putt', () => {
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

            expect(onStatsChange).toHaveBeenCalledWith(20, 10, false, undefined, undefined);
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

            expect(onStatsChange).toHaveBeenCalledWith(10, 25, true, undefined, undefined);
        });

        it('does not flip toggle to Short when second putt exceeds first putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
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
        });
    });

    describe('third putt', () => {
        it('hides third putt when 3-putt not selected', () => {
            const onStatsChange = jest.fn();
            const { queryByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={false}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            expect(queryByTestId('third-putt-input')).toBeFalsy();
        });

        it('renders third putt input blank when no initial value given', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                />
            );

            const input = getByTestId('third-putt-input');
            expect(input.props.value).toBe('');
        });

        it('shows third putt when 3-putt selected with initial value', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialThirdPutt={3}
                />
            );

            expect(getByTestId('third-putt-input').props.value).toBe('3');
        });

        it('calls onStatsChange when third putt changes', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondPutt={10}
                    initialThirdPutt={3}
                />
            );

            onStatsChange.mockClear();

            const input = getByTestId('third-putt-input');
            fireEvent.changeText(input, '4');

            expect(onStatsChange).toHaveBeenCalledWith(
                20,
                10,
                expect.any(Boolean),
                4,
                expect.any(Boolean)
            );
        });

        it('does not allow short third putt > second putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondPutt={8}
                    initialThirdIsLong={false}
                />
            );

            onStatsChange.mockClear();

            // Try to set short 3rd putt to 10 (bigger than 2nd putt of 8)
            const thirdPuttInput = getByTestId('third-putt-input');
            fireEvent.changeText(thirdPuttInput, '10');

            expect(onStatsChange).not.toHaveBeenCalled();
        });

        it('allows short third putt <= second putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={20}
                    initialSecondPutt={10}
                    initialThirdIsLong={false}
                />
            );

            onStatsChange.mockClear();

            const thirdPuttInput = getByTestId('third-putt-input');
            fireEvent.changeText(thirdPuttInput, '5');

            expect(onStatsChange).toHaveBeenCalledWith(20, 10, expect.any(Boolean), 5, false);
        });

        it('allows long third putt > second putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialFirstPutt={10}
                    initialSecondPutt={5}
                    initialThirdIsLong={true}
                />
            );

            onStatsChange.mockClear();

            // Long putt can be bigger than second putt
            const thirdPuttInput = getByTestId('third-putt-input');
            fireEvent.changeText(thirdPuttInput, '15');

            expect(onStatsChange).toHaveBeenCalledWith(10, 5, expect.any(Boolean), 15, true);
        });

        it('does not flip toggle to Short when third putt exceeds second putt', () => {
            const onStatsChange = jest.fn();
            const { getByTestId } = render(
                <PuttingStatsInput
                    holePar={4}
                    threePuttSelected={true}
                    onStatsChange={onStatsChange}
                    initialSecondPutt={5}
                    initialThirdPutt={10}
                    initialThirdIsLong={true}
                />
            );

            onStatsChange.mockClear();

            // Try to switch to Short when third putt (10) > second putt (5)
            const shortButton = getByTestId('third-putt-toggle-short');
            fireEvent.press(shortButton);

            // onStatsChange should not be called, toggle press has no effect
            expect(onStatsChange).not.toHaveBeenCalled();
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

            expect(onStatsChange).toHaveBeenCalledWith(300, expect.any(Number), expect.any(Boolean), undefined, undefined);
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

            expect(onStatsChange).toHaveBeenCalledWith(0, expect.any(Number), expect.any(Boolean), undefined, undefined);
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
});
