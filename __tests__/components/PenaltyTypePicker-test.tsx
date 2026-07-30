import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PenaltyTypePicker from '../../components/PenaltyTypePicker';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
        errorText: '#fd0303',
        divider: '#333',
    }),
}));

describe('PenaltyTypePicker', () => {
    it('renders dropdown toggle button', () => {
        const onSelectPenaltyType = jest.fn();
        const { getByTestId } = render(
            <PenaltyTypePicker selectedPenaltyType={undefined} onSelectPenaltyType={onSelectPenaltyType} />
        );

        expect(getByTestId('penalty-type-picker-dropdown-toggle')).toBeTruthy();
    });

    it('shows placeholder text when no penalty type selected', () => {
        const onSelectPenaltyType = jest.fn();
        const { getByText } = render(
            <PenaltyTypePicker selectedPenaltyType={undefined} onSelectPenaltyType={onSelectPenaltyType} />
        );

        expect(getByText('Select penalty type')).toBeTruthy();
    });

    it('opens dropdown modal when toggle pressed', async () => {
        const onSelectPenaltyType = jest.fn();
        const { getByTestId } = render(
            <PenaltyTypePicker selectedPenaltyType={undefined} onSelectPenaltyType={onSelectPenaltyType} />
        );

        fireEvent.press(getByTestId('penalty-type-picker-dropdown-toggle'));

        await waitFor(() => {
            expect(getByTestId('penalty-type-picker-modal')).toBeTruthy();
        });
    });

    it('displays all penalty types in dropdown', async () => {
        const onSelectPenaltyType = jest.fn();
        const { getByTestId, getByText } = render(
            <PenaltyTypePicker selectedPenaltyType={undefined} onSelectPenaltyType={onSelectPenaltyType} />
        );

        fireEvent.press(getByTestId('penalty-type-picker-dropdown-toggle'));

        await waitFor(() => {
            expect(getByText('Out of bounds')).toBeTruthy();
            expect(getByText('Water hazard')).toBeTruthy();
            expect(getByText('Unplayable lie')).toBeTruthy();
            expect(getByText('Other 1-shot penalty')).toBeTruthy();
            expect(getByText('General penalty')).toBeTruthy();
        });
    });

    it('calls onSelectPenaltyType when option selected', async () => {
        const onSelectPenaltyType = jest.fn();
        const { getByTestId } = render(
            <PenaltyTypePicker selectedPenaltyType={undefined} onSelectPenaltyType={onSelectPenaltyType} />
        );

        fireEvent.press(getByTestId('penalty-type-picker-dropdown-toggle'));

        await waitFor(() => {
            fireEvent.press(getByTestId('penalty-type-picker-option-Out of bounds'));
        });

        expect(onSelectPenaltyType).toHaveBeenCalledWith('Out of bounds');
    });

    it('displays selected penalty type in toggle button', () => {
        const onSelectPenaltyType = jest.fn();
        const { getByText, queryByText } = render(
            <PenaltyTypePicker selectedPenaltyType="Water hazard" onSelectPenaltyType={onSelectPenaltyType} />
        );

        expect(getByText('Water hazard')).toBeTruthy();
        expect(queryByText('Select penalty type')).toBeNull();
    });

    it('does not render error when showError is false', () => {
        const onSelectPenaltyType = jest.fn();
        const { queryByTestId } = render(
            <PenaltyTypePicker selectedPenaltyType={undefined} onSelectPenaltyType={onSelectPenaltyType} showError={false} />
        );

        expect(queryByTestId('penalty-type-picker-error')).toBeNull();
    });

    it('renders error when showError is true', () => {
        const onSelectPenaltyType = jest.fn();
        const { getByTestId } = render(
            <PenaltyTypePicker selectedPenaltyType={undefined} onSelectPenaltyType={onSelectPenaltyType} showError={true} />
        );

        expect(getByTestId('penalty-type-picker-error')).toBeTruthy();
    });
});
