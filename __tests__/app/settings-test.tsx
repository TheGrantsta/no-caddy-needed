import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import Settings from '../../app/settings';
import { getSettingsService, saveSettingsService } from '../../service/DbService';
import { openStoreReviewService } from '../../service/ReviewService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        colours: require('../../assets/colours').default,
    }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn(() => ({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, reviewPromptShown: false, whatsNewVersionSeen: '', settingsOnboardingSeen: false, performOnboardingSeen: false, tempoBpm: 60, units: 'yards', skipStatsFlowEnabled: false, quickTools: ['wind', 'tempo', 'random'] })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
}));

const mockSetOptions = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useNavigation: () => ({ setOptions: mockSetOptions }),
    useRouter: () => ({ back: mockBack }),
}));

jest.mock('../../service/ReviewService', () => ({
    openStoreReviewService: jest.fn(),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;
const mockOpenStoreReview = openStoreReviewService as jest.Mock;

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
}));

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: { expoConfig: { version: '1.2.3' } },
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

describe('Settings page', () => {
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
        whatsNewVersionSeen: '',
        settingsOnboardingSeen: true,
        performOnboardingSeen: false,
        tempoBpm: 60,
        units: 'yards',
        skipStatsFlowEnabled: false,
        quickTools: ['wind', 'tempo', 'random'],
        badHoleReassuranceEnabled: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(baseSettings);
        mockSaveSettingsService.mockResolvedValue(true);
    });

    it('showsTheSettingsTitleAndNoDoneButtonBecauseChangesSaveAsTheyAreMade', () => {
        const { getByText, queryByTestId, queryByText } = render(<Settings />);

        expect(getByText('Settings')).toBeTruthy();
        expect(queryByText('Done')).toBeNull();
        expect(queryByTestId('settings-done-button')).toBeNull();
    });

    it('shouldSaveAChangedQuickToolWhenAShortcutIsChosen', async () => {
        mockSaveSettingsService.mockResolvedValue(true);
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('quick-tool-0-dropdown-toggle'));
        fireEvent.press(getByTestId('quick-tool-0-option-Lag putting'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ quickTools: ['lag-putting', 'tempo', 'random'] }));
        });
    });

    it('shouldShowTheInfoButtonWithAWhiteBackgroundLikeTheBackButton', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('settings-info-button')).toHaveStyle({ backgroundColor: require('../../assets/colours').default.backgroundLight });
    });

    it('showsTheSettingsTitleLeftAligned', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Settings')).toHaveStyle({ textAlign: 'left' });
    });

    it('showsABackButtonLeftOfTheSettingsTitleThatReturnsToThePreviousScreen', () => {
        const { getByLabelText } = render(<Settings />);

        fireEvent.press(getByLabelText('Back'));

        expect(mockBack).toHaveBeenCalled();
    });

    it('keepsTheStackHeaderWithTheLogoAndBackButton', () => {
        render(<Settings />);

        expect(mockSetOptions).not.toHaveBeenCalledWith(expect.objectContaining({ headerShown: false }));
    });

    it('showsGolfUnitsAndSoundSectionsOnOnePage', () => {
        const { getByText, queryByTestId } = render(<Settings />);

        expect(getByText('GOLF')).toBeTruthy();
        expect(getByText('UNITS')).toBeTruthy();
        expect(getByText('SOUND & NOTIFICATIONS')).toBeTruthy();
        expect(queryByTestId('settings-tab-golf')).toBeNull();
        expect(queryByTestId('settings-tab-system')).toBeNull();
    });

    it('showsGolfThenSoundAndNotificationsThenUnits', () => {
        const { toJSON } = render(<Settings />);
        const page = JSON.stringify(toJSON());

        const golf = page.indexOf('GOLF');
        const sound = page.indexOf('SOUND & NOTIFICATIONS');
        const units = page.indexOf('UNITS');
        expect(golf).toBeGreaterThanOrEqual(0);
        expect(sound).toBeGreaterThan(golf);
        expect(units).toBeGreaterThan(sound);
    });

    it('showsTheExportAndRateRowsAndTheVersion', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Export stats for AI coaching')).toBeTruthy();
        expect(getByText('Rate my app')).toBeTruthy();
        expect(getByText('Version 1.2.3')).toBeTruthy();
    });

    it('callsOpenStoreReviewServiceWhenRateMyAppIsPressed', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('rate-app-button'));

        expect(mockOpenStoreReview).toHaveBeenCalled();
    });

    it('savesNotificationsOffWhenItsSwitchIsTurnedOff', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(getByTestId('notifications-switch'), 'valueChange', false);

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ notificationsEnabled: false }));
        });
    });

    it('savesSoundsOffWhenItsSwitchIsTurnedOff', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(getByTestId('sounds-switch'), 'valueChange', false);

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ soundsEnabled: false }));
        });
    });

    it('savesTheVoiceChosenFromTheDropdown', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('voice-dropdown-toggle'));
        fireEvent.press(getByTestId('voice-option-Male'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ voice: 'male' }));
        });
    });

    it('savesMetresWhenMetresIsPressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('units-metres'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ units: 'metres' }));
        });
    });

    it('doesNotShowThePreShotRoutineSwitchOrTextBox', () => {
        const { queryByText, queryByTestId } = render(<Settings />);

        expect(queryByText('Show pre-shot routine')).toBeNull();
        expect(queryByTestId('preshot-switch')).toBeNull();
        expect(queryByTestId('preshot-routine-input')).toBeNull();
    });

    it('savesScoreOnlyModeWhenItsSwitchIsTurnedOn', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(getByTestId('score-only-switch'), 'valueChange', true);

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ skipStatsFlowEnabled: true }));
        });
    });

    it('savesBadHoleReminderWhenItsSwitchIsTurnedOff', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(getByTestId('bad-hole-reassurance-switch'), 'valueChange', false);

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ badHoleReassuranceEnabled: false }));
        });
    });

    it('showsTheOnboardingOverlayWhenNotSeenBefore', () => {
        mockGetSettingsService.mockReturnValue({ ...baseSettings, settingsOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('hidesTheOnboardingOverlayWhenAlreadySeen', () => {
        const { queryByTestId } = render(<Settings />);

        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('showsTheOnboardingOverlayWhenTheInfoButtonIsPressed', () => {
        const { getByTestId, queryByTestId } = render(<Settings />);

        expect(queryByTestId('onboarding-overlay')).toBeNull();
        fireEvent.press(getByTestId('settings-info-button'));

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('savesSettingsOnboardingSeenWhenDismissed', async () => {
        mockGetSettingsService.mockReturnValue({ ...baseSettings, settingsOnboardingSeen: false });
        const { getByTestId, queryByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('done-button'));

        expect(queryByTestId('onboarding-overlay')).toBeNull();
        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({ settingsOnboardingSeen: true }));
        });
    });

    it('shouldDisableBouncingSoPageDoesNotStretchWhenPulledDown', () => {
        const { UNSAFE_getByType } = render(<Settings />);

        expect(UNSAFE_getByType(ScrollView).props.bounces).toBe(false);
    });

    it('shouldDisableAndroidOverscrollSoBehaviourMatchesIos', () => {
        const { UNSAFE_getByType } = render(<Settings />);

        expect(UNSAFE_getByType(ScrollView).props.overScrollMode).toBe('never');
    });

    it('shouldLetTapsPassThroughToButtonsWhileKeyboardIsOpen', () => {
        const { UNSAFE_getByType } = render(<Settings />);

        expect(UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
    });

    it('shouldNotHaveRefreshControlOnSettings', () => {
        const { UNSAFE_getByType } = render(<Settings />);

        expect(UNSAFE_getByType(ScrollView).props.refreshControl).toBeUndefined();
    });
});
