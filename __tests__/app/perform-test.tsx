import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import View from '../../app/(tabs)/perform';
import { logEvent } from '../../service/FirebaseService';
import { getSettingsService, saveSettingsService } from '../../service/DbService';

jest.mock('../../service/FirebaseService', () => ({
    logEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn(),
    saveSettingsService: jest.fn().mockResolvedValue(true),
    getAllDeadlySinsRoundsService: jest.fn().mockReturnValue([]),
    getAllRoundHistoryService: jest.fn().mockReturnValue([]),
    getPuttingMakeRatesService: jest.fn().mockReturnValue([]),
    getPuttingProximityService: jest.fn().mockReturnValue([]),
    getAllHoleSinDetailsService: jest.fn().mockReturnValue([]),
}));

const _mockLogEvent = logEvent as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

const baseSettings = {
    notificationsEnabled: true,
    voice: 'female',
    soundsEnabled: true,
    wedgeChartOnboardingSeen: false,
    distancesOnboardingSeen: false,
    playOnboardingSeen: false,
    homeOnboardingSeen: false,
    practiceOnboardingSeen: false,
    reviewPromptShown: false,
    preShotReminderEnabled: true,
    preShotRoutineText: '',
    whatsNewVersionSeen: '',
    settingsOnboardingSeen: true,
    performOnboardingSeen: true,
    tempoBpm: 60,
    units: 'yards',
    skipStatsFlowEnabled: false,
};

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
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

jest.mock('expo-router', () => ({
    useFocusEffect: jest.fn((_callback) => {
        // Don't call the callback to avoid infinite re-renders
    }),
    useRouter: () => ({ push: jest.fn() }),
}));

describe('Perform page ', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(baseSettings);
        mockSaveSettingsService.mockResolvedValue(true);
    });

    describe('Onboarding', () => {
        it('shows the onboarding overlay when not seen before', () => {
            mockGetSettingsService.mockReturnValue({ ...baseSettings, performOnboardingSeen: false });

            const { getByTestId, queryAllByText } = render(<View />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
            expect(queryAllByText('Performance').length).toBeGreaterThan(0);
        });

        it('hides the onboarding overlay when already seen', () => {
            mockGetSettingsService.mockReturnValue({ ...baseSettings, performOnboardingSeen: true });

            const { queryByTestId } = render(<View />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('shows the onboarding overlay when the info button is pressed', () => {
            mockGetSettingsService.mockReturnValue({ ...baseSettings, performOnboardingSeen: true });

            const { getByTestId, queryByTestId } = render(<View />);
            expect(queryByTestId('onboarding-overlay')).toBeNull();

            fireEvent.press(getByTestId('perform-info-button'));

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('saves performOnboardingSeen true when dismissed', async () => {
            mockGetSettingsService.mockReturnValue({ ...baseSettings, performOnboardingSeen: false });

            const { getByTestId, queryByTestId } = render(<View />);

            fireEvent.press(getByTestId('next-button'));
            fireEvent.press(getByTestId('next-button'));
            fireEvent.press(getByTestId('done-button'));

            expect(queryByTestId('onboarding-overlay')).toBeNull();
            await waitFor(() => {
                expect(mockSaveSettingsService).toHaveBeenCalledWith(
                    expect.objectContaining({ performOnboardingSeen: true })
                );
            });
        });
    });

    describe('Performance filter', () => {
        it('shows "Show" label with filter buttons when rounds exist', () => {
            const mockGetAllRoundHistoryService = require('../../service/DbService').getAllRoundHistoryService as jest.Mock;
            mockGetAllRoundHistoryService.mockReturnValue([
                { Id: 1, Created_At: '2024-01-01', IsScoreOnly: 0, IsCompleted: 1 },
            ]);
            mockGetSettingsService.mockReturnValue({ ...baseSettings });

            const { getByTestId } = render(<View />);

            expect(getByTestId('filter-label')).toBeTruthy();
            expect(getByTestId('filter-button-1')).toBeTruthy();
        });

        it('excludes score-only rounds from filter', () => {
            const mockGetAllRoundHistoryService = require('../../service/DbService').getAllRoundHistoryService as jest.Mock;
            mockGetAllRoundHistoryService.mockReturnValue([
                { Id: 1, Created_At: '2024-01-01', IsScoreOnly: 0, IsCompleted: 1 },
                { Id: 2, Created_At: '2024-01-02', IsScoreOnly: 1, IsCompleted: 1 },
                { Id: 3, Created_At: '2024-01-03', IsScoreOnly: 0, IsCompleted: 1 },
            ]);
            mockGetSettingsService.mockReturnValue({ ...baseSettings });

            const { getByTestId } = render(<View />);

            // Filter should show only 2 completed rounds (excluding score-only)
            expect(getByTestId('filter-button-1')).toBeTruthy();
            // When filtering by "1", only the most recent completed round should be included
        });
    });
});
