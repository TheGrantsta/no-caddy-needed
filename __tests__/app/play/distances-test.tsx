import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DistancesScreen from '../../../app/play/distances';
import { getClubDistancesService, saveClubDistancesService } from '../../../service/DbService';

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
const mockSaveClubDistances = saveClubDistancesService as jest.Mock;

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

        expect(getByText('Club carry distances NOT total distances to choose the right club')).toBeTruthy();
        expect(getByTestId('club-input-0').props.value).toBe('Driver');
        expect(getByTestId('distance-input-0').props.value).toBe('250');
    });

    it('shows empty message when no distances exist', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByText } = render(<DistancesScreen />);

        expect(getByText('Club carry distances NOT total distances to choose the right club')).toBeTruthy();
    });

    it('shows add club button', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByTestId } = render(<DistancesScreen />);

        expect(getByTestId('add-club-button')).toBeTruthy();
    });

    it('shows save button', () => {
        mockGetClubDistances.mockReturnValue([]);

        const { getByTestId } = render(<DistancesScreen />);

        expect(getByTestId('save-distances-button')).toBeTruthy();
    });

    it('should clear all distances from UI when clear is confirmed', async () => {
        mockGetClubDistances.mockReturnValue([
            { Id: 1, Club: 'Driver', CarryDistance: 250, TotalDistance: 270, SortOrder: 1 },
            { Id: 2, Club: '3 Wood', CarryDistance: 220, TotalDistance: 240, SortOrder: 2 },
        ]);
        mockSaveClubDistances.mockResolvedValue(true);

        const { getByTestId, queryByTestId } = render(<DistancesScreen />);

        // Verify distances are shown
        expect(getByTestId('club-input-0').props.value).toBe('Driver');
        expect(getByTestId('club-input-1').props.value).toBe('3 Wood');

        // Click clear button
        fireEvent.press(getByTestId('clear-button'));

        // Wait for confirm button to appear
        await waitFor(() => {
            expect(getByTestId('confirm-clear-button')).toBeTruthy();
        });

        // Confirm clear
        fireEvent.press(getByTestId('confirm-clear-button'));

        await waitFor(() => {
            expect(queryByTestId('club-input-0')).toBeFalsy();
            expect(queryByTestId('club-input-1')).toBeFalsy();
        });
    });
});
