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

const mockLogEvent = logEvent as jest.Mock;
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

describe('Perform page ', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(baseSettings);
        mockSaveSettingsService.mockResolvedValue(true);
    });

    it('renders deadly sins as the default section', () => {
        const { getByText } = render(<View />);

        expect(getByText('Track your 7 Deadly Sins across rounds')).toBeTruthy();
    });

    describe('Onboarding', () => {
        it('shows the onboarding overlay when not seen before', () => {
            mockGetSettingsService.mockReturnValue({ ...baseSettings, performOnboardingSeen: false });

            const { getByTestId, getByText } = render(<View />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
            expect(getByText('Performance guide')).toBeTruthy();
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
});
