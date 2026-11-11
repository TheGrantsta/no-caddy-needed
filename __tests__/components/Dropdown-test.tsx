import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dropdown from '../../components/Dropdown';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
        errorText: '#fd0303',
        red: '#ff0000',
        divider: '#333',
    }),
}));

describe('Dropdown', () => {
    const mockOptions = ['Option A', 'Option B', 'Option C'];

    it('renders dropdown toggle button', () => {
        const onSelectOption = jest.fn();
        const { getByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        expect(getByTestId('test-dropdown-toggle')).toBeTruthy();
    });

    it('shows placeholder text when no option selected', () => {
        const onSelectOption = jest.fn();
        const { getByText } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" placeholder="Pick one" onSelectOption={onSelectOption} />
        );

        expect(getByText('Pick one')).toBeTruthy();
    });

    it('shouldListTheOptionsInlineBelowTheToggleWithoutOpeningAModalByDefault', () => {
        const { Modal } = require('react-native');
        const onSelectOption = jest.fn();
        const { getByTestId, getByText, UNSAFE_queryAllByType } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        fireEvent.press(getByTestId('test-dropdown-toggle'));

        expect(getByText('Option A')).toBeTruthy();
        expect(UNSAFE_queryAllByType(Modal)).toHaveLength(0);
    });

    it('displays all options in dropdown', async () => {
        const onSelectOption = jest.fn();
        const { getByTestId, getByText } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        fireEvent.press(getByTestId('test-dropdown-toggle'));

        await waitFor(() => {
            expect(getByText('Option A')).toBeTruthy();
            expect(getByText('Option B')).toBeTruthy();
            expect(getByText('Option C')).toBeTruthy();
        });
    });

    it('calls onSelectOption when option selected', async () => {
        const onSelectOption = jest.fn();
        const { getByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        fireEvent.press(getByTestId('test-dropdown-toggle'));

        await waitFor(() => {
            fireEvent.press(getByTestId('test-option-Option A'));
        });

        expect(onSelectOption).toHaveBeenCalledWith('Option A');
    });

    it('displays selected option in toggle button', () => {
        const onSelectOption = jest.fn();
        const { getByText, _queryByText } = render(
            <Dropdown options={mockOptions} selectedOption="Option B" testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        expect(getByText('Option B')).toBeTruthy();
    });

    it('does not render error when showError is false', () => {
        const onSelectOption = jest.fn();
        const { queryByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} showError={false} />
        );

        expect(queryByTestId('test-error')).toBeNull();
    });

    it('renders error when showError is true', () => {
        const onSelectOption = jest.fn();
        const { getByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} showError={true} />
        );

        expect(getByTestId('test-error')).toBeTruthy();
    });

    it('renders red border when showError is true', () => {
        const onSelectOption = jest.fn();
        const { getByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} showError={true} />
        );

        const toggle = getByTestId('test-dropdown-toggle');
        const styles = toggle.props.style;
        expect(styles.borderColor).toBe('#ff0000');
    });

    it('renders primary border when showError is false', () => {
        const onSelectOption = jest.fn();
        const { getByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} showError={false} />
        );

        const toggle = getByTestId('test-dropdown-toggle');
        const styles = toggle.props.style;
        expect(styles.borderColor).toBe('#2D5A3D');
    });

    describe('inline variant', () => {
        it('shouldRenderTheInlineToggleWithoutABorderOrBackground', () => {
            const { StyleSheet } = require('react-native');
            const { getByTestId } = render(
                <Dropdown options={['Driver', '3 Wood']} selectedOption="Driver" onSelectOption={jest.fn()} testIDPrefix="inline-test" inline />
            );

            const style = StyleSheet.flatten(getByTestId('inline-test-dropdown-toggle').props.style);
            expect(style.borderWidth ?? 0).toBe(0);
            expect(style.backgroundColor ?? 'transparent').toBe('transparent');
        });
    });

    it('shouldCloseTheListWhenTheToggleIsPressedAgainWithoutChoosingAnOption', () => {
        const onSelectOption = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <Dropdown options={mockOptions} selectedOption="Option A" testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        fireEvent.press(getByTestId('test-dropdown-toggle'));
        fireEvent.press(getByTestId('test-dropdown-toggle'));

        expect(queryByTestId('test-option-Option B')).toBeNull();
        expect(onSelectOption).not.toHaveBeenCalled();
    });

    it('shouldCloseTheInlineListWhenAnOptionIsChosen', () => {
        const onSelectOption = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        fireEvent.press(getByTestId('test-dropdown-toggle'));
        fireEvent.press(getByTestId('test-option-Option B'));

        expect(onSelectOption).toHaveBeenCalledWith('Option B');
        expect(queryByTestId('test-option-Option B')).toBeNull();
    });
});
