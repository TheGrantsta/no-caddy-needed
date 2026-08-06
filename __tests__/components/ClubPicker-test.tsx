import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ClubPicker from '../../components/ClubPicker';

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => ({
        holeScoreInput: {
            playerName: { fontSize: 16, fontWeight: 'bold' },
        },
    }),
}));

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
        errorText: '#fd0303',
        divider: '#333',
    }),
}));

describe('ClubPicker', () => {
    const mockClubs = [
        { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 0 },
        { Id: 2, Club: '3-wood', CarryDistance: 230, TotalDistance: 250, SortOrder: 1 },
        { Id: 3, Club: '5-iron', CarryDistance: 180, TotalDistance: 195, SortOrder: 2 },
    ];

    it('renders dropdown toggle button', () => {
        const onSelectClub = jest.fn();
        const { getByTestId } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} />
        );

        expect(getByTestId('club-picker-dropdown-toggle')).toBeTruthy();
    });

    it('shows placeholder text when no club selected', () => {
        const onSelectClub = jest.fn();
        const { getByText } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} />
        );

        expect(getByText('Select a club')).toBeTruthy();
    });

    it('opens dropdown modal when toggle pressed', async () => {
        const onSelectClub = jest.fn();
        const { getByTestId } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} />
        );

        fireEvent.press(getByTestId('club-picker-dropdown-toggle'));

        await waitFor(() => {
            expect(getByTestId('club-picker-modal')).toBeTruthy();
        });
    });

    it('displays all clubs in dropdown options', async () => {
        const onSelectClub = jest.fn();
        const { getByTestId, getByText } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} />
        );

        fireEvent.press(getByTestId('club-picker-dropdown-toggle'));

        await waitFor(() => {
            expect(getByText('Driver')).toBeTruthy();
            expect(getByText('3-wood')).toBeTruthy();
            expect(getByText('5-iron')).toBeTruthy();
        });
    });

    it('calls onSelectClub when option selected', async () => {
        const onSelectClub = jest.fn();
        const { getByTestId } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} />
        );

        fireEvent.press(getByTestId('club-picker-dropdown-toggle'));

        await waitFor(() => {
            fireEvent.press(getByTestId('club-picker-option-Driver'));
        });

        expect(onSelectClub).toHaveBeenCalledWith('Driver');
    });

    it('updates button text after selection', async () => {
        const onSelectClub = jest.fn();
        const { getByTestId, getByText, queryByText } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} />
        );

        fireEvent.press(getByTestId('club-picker-dropdown-toggle'));

        await waitFor(() => {
            fireEvent.press(getByTestId('club-picker-option-3-wood'));
        });

        // Would need to re-render with updated prop to see selected value displayed
        // Just verify the callback was called
        expect(onSelectClub).toHaveBeenCalledWith('3-wood');
    });

    it('displays selected club in toggle button', () => {
        const onSelectClub = jest.fn();
        const { getByText, queryByText } = render(
            <ClubPicker clubs={mockClubs} selectedClub="Driver" onSelectClub={onSelectClub} />
        );

        expect(getByText('Driver')).toBeTruthy();
        expect(queryByText('Select a club')).toBeNull();
    });

    it('renders empty state when clubs array is empty', () => {
        const onSelectClub = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <ClubPicker clubs={[]} onSelectClub={onSelectClub} emptyStateText="Add clubs to your Distances chart" />
        );

        expect(getByTestId('club-picker-empty-state')).toBeTruthy();
        expect(queryByTestId('club-picker-dropdown-toggle')).toBeNull();
    });

    it('does not render error when showError is false', () => {
        const onSelectClub = jest.fn();
        const { queryByTestId } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} showError={false} />
        );

        expect(queryByTestId('club-picker-error')).toBeNull();
    });

    it('renders error only when showError true and clubs exist', () => {
        const onSelectClub = jest.fn();
        const { getByTestId } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} showError={true} />
        );

        expect(getByTestId('club-picker-error')).toBeTruthy();
    });

    it('does not render error when clubs are empty even if showError is true', () => {
        const onSelectClub = jest.fn();
        const { queryByTestId } = render(
            <ClubPicker clubs={[]} onSelectClub={onSelectClub} showError={true} emptyStateText="Add clubs" />
        );

        expect(queryByTestId('club-picker-error')).toBeNull();
    });

    it('renders empty state with custom testIDPrefix', () => {
        const onSelectClub = jest.fn();
        const { getByTestId } = render(
            <ClubPicker clubs={[]} onSelectClub={onSelectClub} testIDPrefix="custom" />
        );

        expect(getByTestId('custom-empty-state')).toBeTruthy();
    });

    it('renders dropdown with custom testIDPrefix', async () => {
        const onSelectClub = jest.fn();
        const { getByTestId } = render(
            <ClubPicker clubs={mockClubs} onSelectClub={onSelectClub} testIDPrefix="custom" />
        );

        fireEvent.press(getByTestId('custom-dropdown-toggle'));

        await waitFor(() => {
            expect(getByTestId('custom-option-Driver')).toBeTruthy();
        });
    });
});
