import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DistancesScreen from '../../../app/play/distances';
import { getClubDistancesService } from '../../../service/DbService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../service/DbService', () => ({
    getClubDistancesService: jest.fn(),
    saveClubDistancesService: jest.fn(),
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
        homeOnboardingSeen: true,
        practiceOnboardingSeen: true,
        units: 'yards',
    }),
    saveSettingsService: jest.fn().mockResolvedValue(true),
}));

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ back: mockBack, push: jest.fn() }),
}));

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
}));

jest.mock('../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showResult: jest.fn(),
    }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

const mockGetClubDistances = getClubDistancesService as jest.Mock;

describe('Distances screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders distances heading', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByText } = render(<DistancesScreen />);

        expect(getByText('Distances')).toBeTruthy();
    });

    it('shows club distances when data exists', () => {
        mockGetClubDistances.mockReturnValue([
            { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
        ]);

        const { getByTestId, getByText } = render(<DistancesScreen />);

        expect(getByText('Driver')).toBeTruthy();
        expect(getByTestId('read-club-row-0')).toBeTruthy();
        expect(getByText('250 yd')).toBeTruthy();
    });

    it('shows empty message when no distances exist', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByTestId } = render(<DistancesScreen />);

        expect(getByTestId('distances-empty')).toBeTruthy();
    });

    it('shows add club button', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByTestId } = render(<DistancesScreen />);
        fireEvent.press(getByTestId('edit-distances-button'));

        expect(getByTestId('add-club-button')).toBeTruthy();
    });

    it('shows save button', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByTestId } = render(<DistancesScreen />);
        fireEvent.press(getByTestId('edit-distances-button'));

        expect(getByTestId('save-distances-button')).toBeTruthy();
    });

    describe('My Bag layout', () => {
        const twoClubs = [
            { Id: 1, Club: 'Driver', CarryDistance: 230, TotalDistance: 250, SortOrder: 1 },
            { Id: 2, Club: '3 Wood', CarryDistance: 210, TotalDistance: 225, SortOrder: 2 },
        ];

        beforeEach(() => {
            mockGetClubDistances.mockReturnValue(twoClubs);
        });

        it('shouldShowBackButtonThatReturnsToMyBag', () => {
            const { getByTestId } = render(<DistancesScreen />);

            fireEvent.press(getByTestId('distances-back-button'));

            expect(mockBack).toHaveBeenCalled();
        });

        it('shouldNotShowClearAllButtonInEditMode', () => {
            const { getByTestId, queryByTestId } = render(<DistancesScreen />);

            fireEvent.press(getByTestId('edit-distances-button'));

            expect(queryByTestId('clear-button')).toBeNull();
            expect(queryByTestId('confirm-clear-button')).toBeNull();
        });

        it('shouldShowEditButtonInTheHeader', () => {
            const { getByTestId } = render(<DistancesScreen />);

            expect(getByTestId('edit-distances-button')).toHaveTextContent('Edit');
        });

        it('shouldNotShowTheInfoButton', () => {
            const { queryByTestId } = render(<DistancesScreen />);

            expect(queryByTestId('info-button')).toBeNull();
        });

        it('shouldShowCarryAndTotalSegments', () => {
            const { getByTestId } = render(<DistancesScreen />);

            expect(getByTestId('metric-carry')).toBeTruthy();
            expect(getByTestId('metric-total')).toBeTruthy();
        });

        it('shouldListClubsReadOnlyByDefault', () => {
            const { getByTestId, queryByTestId } = render(<DistancesScreen />);

            expect(getByTestId('read-club-row-0')).toBeTruthy();
            expect(queryByTestId('club-input-0')).toBeNull();
        });

        it('shouldShowCarryColumnByDefault', () => {
            const { getByTestId, getByText } = render(<DistancesScreen />);

            expect(getByTestId('read-metric-header')).toHaveTextContent('Carry');
            expect(getByText('230 yd')).toBeTruthy();
        });

        it('shouldShowTotalColumnWhenTotalSegmentPressed', () => {
            const { getByTestId, getByText } = render(<DistancesScreen />);

            fireEvent.press(getByTestId('metric-total'));

            expect(getByTestId('read-metric-header')).toHaveTextContent('Total');
            expect(getByText('250 yd')).toBeTruthy();
        });

        it('shouldShowEmptyMessageWhenNoClubsAreRecorded', () => {
            mockGetClubDistances.mockReturnValue([]);
            const { getByTestId } = render(<DistancesScreen />);

            expect(getByTestId('distances-empty')).toBeTruthy();
        });

        it('shouldEnterEditModeWhenEditPressed', () => {
            const { getByTestId } = render(<DistancesScreen />);

            fireEvent.press(getByTestId('edit-distances-button'));

            expect(getByTestId('club-input-0').props.value).toBe('Driver');
            expect(getByTestId('edit-distances-button')).toHaveTextContent('Done');
        });

        it('shouldReturnToReadOnlyListWhenDonePressed', () => {
            const { getByTestId, queryByTestId } = render(<DistancesScreen />);

            fireEvent.press(getByTestId('edit-distances-button'));
            fireEvent.press(getByTestId('edit-distances-button'));

            expect(queryByTestId('club-input-0')).toBeNull();
            expect(getByTestId('read-club-row-0')).toBeTruthy();
        });
    });
});
