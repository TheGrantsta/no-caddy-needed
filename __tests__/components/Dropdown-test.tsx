import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dropdown from '../../components/Dropdown';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
        errorText: '#fd0303',
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

    it('opens dropdown modal when toggle pressed', async () => {
        const onSelectOption = jest.fn();
        const { getByTestId } = render(
            <Dropdown options={mockOptions} testIDPrefix="test" onSelectOption={onSelectOption} />
        );

        fireEvent.press(getByTestId('test-dropdown-toggle'));

        await waitFor(() => {
            expect(getByTestId('test-modal')).toBeTruthy();
        });
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
        const { getByText, queryByText } = render(
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
});
