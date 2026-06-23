import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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
    getSettingsService: jest.fn(() => ({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
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
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });
        mockSaveSettingsService.mockResolvedValue(true);
    });

    // System settings live behind the "System" tab (the page defaults to Golf).
    const renderSystem = () => {
        const utils = render(<Settings />);
        fireEvent.press(utils.getByTestId('settings-tab-system'));
        return utils;
    };

    it('renders page title', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Settings')).toBeTruthy();
    });

    it('renders Rate my app button', () => {
        const { getByTestId, getByText } = render(<Settings />);

        expect(getByTestId('rate-app-button')).toBeTruthy();
        expect(getByText('Rate my app')).toBeTruthy();
    });

    it('renders the Golf and System group tabs', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('settings-tab-golf')).toBeTruthy();
        expect(getByTestId('settings-tab-system')).toBeTruthy();
    });

    it('defaults to the Golf group (Practice visible, System settings hidden)', () => {
        const { getByText, queryByText } = render(<Settings />);

        expect(getByText('Practice')).toBeTruthy();
        expect(queryByText('Notifications')).toBeNull();
    });

    it('switches to the System group when its tab is pressed', () => {
        const { getByTestId, getByText, queryByText } = render(<Settings />);

        fireEvent.press(getByTestId('settings-tab-system'));

        expect(getByText('Notifications')).toBeTruthy();
        expect(queryByText('Practice')).toBeNull();
    });

    it('keeps Rate my app and version outside the groups (visible on both tabs)', () => {
        const { getByTestId, getByText } = render(<Settings />);

        // Golf (default)
        expect(getByText('Rate my app')).toBeTruthy();
        expect(getByText('Version 1.2.3')).toBeTruthy();

        // System
        fireEvent.press(getByTestId('settings-tab-system'));
        expect(getByText('Rate my app')).toBeTruthy();
        expect(getByText('Version 1.2.3')).toBeTruthy();
    });

    it('calls openStoreReviewService when Rate my app pressed', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('rate-app-button'));

        expect(mockOpenStoreReview).toHaveBeenCalled();
    });

    it('renders notifications heading', () => {
        const { getByText } = renderSystem();

        expect(getByText('Notifications')).toBeTruthy();
    });

    it('renders notifications On button', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('notifications-on')).toBeTruthy();
    });

    it('renders notifications Off button', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('notifications-off')).toBeTruthy();
    });

    it('shows On as selected when notifications enabled', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('notifications-on-selected')).toBeTruthy();
    });

    it('shows Off as selected when notifications disabled', () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });

        const { getByTestId } = renderSystem();

        expect(getByTestId('notifications-off-selected')).toBeTruthy();
    });

    it('calls saveSettingsService with notificationsEnabled false when Off is pressed', async () => {
        const { getByTestId } = renderSystem();

        fireEvent.press(getByTestId('notifications-off'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                notificationsEnabled: false,
                voice: 'female',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
                practiceFrequencyDays: 7,
            });
        });
    });

    it('calls saveSettingsService with notificationsEnabled true when On is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });

        const { getByTestId } = renderSystem();

        fireEvent.press(getByTestId('notifications-on'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                notificationsEnabled: true,
                voice: 'female',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
                practiceFrequencyDays: 7,
            });
        });
    });

    it('renders Sounds heading', () => {
        const { getByText } = renderSystem();

        expect(getByText('Sounds')).toBeTruthy();
    });

    it('renders sounds On button', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('sounds-on')).toBeTruthy();
    });

    it('renders sounds Off button', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('sounds-off')).toBeTruthy();
    });

    it('shows On as selected by default for sounds', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('sounds-on-selected')).toBeTruthy();
    });

    it('shows Off as selected when sounds disabled', () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: false, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });

        const { getByTestId } = renderSystem();

        expect(getByTestId('sounds-off-selected')).toBeTruthy();
    });

    it('calls saveSettingsService with soundsEnabled false when sounds Off is pressed', async () => {
        const { getByTestId } = renderSystem();

        fireEvent.press(getByTestId('sounds-off'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ soundsEnabled: false })
            );
        });
    });

    it('calls saveSettingsService with soundsEnabled true when sounds On is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: false, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = renderSystem();

        fireEvent.press(getByTestId('sounds-on'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ soundsEnabled: true })
            );
        });
    });

    it('renders Voice heading', () => {
        const { getByText } = renderSystem();

        expect(getByText('Voice')).toBeTruthy();
    });

    it('renders Female voice option', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('voice-female')).toBeTruthy();
    });

    it('renders Male voice option', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('voice-male')).toBeTruthy();
    });

    it('renders Neutral voice option', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('voice-neutral')).toBeTruthy();
    });

    it('shows Female as selected by default', () => {
        const { getByTestId } = renderSystem();

        expect(getByTestId('voice-female-selected')).toBeTruthy();
    });

    it('shows Male as selected when settings voice is male', () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'male', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });

        const { getByTestId } = renderSystem();

        expect(getByTestId('voice-male-selected')).toBeTruthy();
    });

    it('shows Neutral as selected when settings voice is neutral', () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'neutral', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });

        const { getByTestId } = renderSystem();

        expect(getByTestId('voice-neutral-selected')).toBeTruthy();
    });

    it('calls saveSettingsService with voice male when Male is pressed', async () => {
        const { getByTestId } = renderSystem();

        fireEvent.press(getByTestId('voice-male'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                notificationsEnabled: true,
                voice: 'male',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
                practiceFrequencyDays: 7,
            });
        });
    });

    it('calls saveSettingsService with voice neutral when Neutral is pressed', async () => {
        const { getByTestId } = renderSystem();

        fireEvent.press(getByTestId('voice-neutral'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                notificationsEnabled: true,
                voice: 'neutral',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
                practiceFrequencyDays: 7,
            });
        });
    });

    it('displays the app version number', () => {
        const { getByText } = render(<Settings />);
        expect(getByText('Version 1.2.3')).toBeTruthy();
    });

    it('calls saveSettingsService with voice female when Female is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'male', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7 });

        const { getByTestId } = renderSystem();

        fireEvent.press(getByTestId('voice-female'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                notificationsEnabled: true,
                voice: 'female',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
                practiceFrequencyDays: 7,
            });
        });
    });

    it('rendersPracticeHeading', () => {
        const { getByText } = render(<Settings />);
        expect(getByText('Practice')).toBeTruthy();
    });

    it('showsPracticeFrequencyDecrementButton', () => {
        const { getByTestId } = render(<Settings />);
        expect(getByTestId('practice-frequency-decrement')).toBeTruthy();
    });

    it('showsPracticeFrequencyIncrementButton', () => {
        const { getByTestId } = render(<Settings />);
        expect(getByTestId('practice-frequency-increment')).toBeTruthy();
    });

    it('showsDefaultPracticeFrequencyOf7', () => {
        const { getByTestId } = render(<Settings />);
        expect(getByTestId('practice-frequency-value').props.children).toBe(7);
    });

    it('showsCustomPracticeFrequencyFromSettings', () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 3 });
        const { getByTestId } = render(<Settings />);
        expect(getByTestId('practice-frequency-value').props.children).toBe(3);
    });

    it('incrementsFrequencyWhenIncrementPressed', async () => {
        const { getByTestId } = render(<Settings />);
        fireEvent.press(getByTestId('practice-frequency-increment'));
        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ practiceFrequencyDays: 8 })
            );
        });
    });

    it('decrementsFrequencyWhenDecrementPressed', async () => {
        const { getByTestId } = render(<Settings />);
        fireEvent.press(getByTestId('practice-frequency-decrement'));
        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ practiceFrequencyDays: 6 })
            );
        });
    });

    it('doesNotDecrementBelowOne', async () => {
        mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 1 });
        const { getByTestId } = render(<Settings />);
        fireEvent.press(getByTestId('practice-frequency-decrement'));
        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ practiceFrequencyDays: 1 })
            );
        });
    });

    describe('Pre-shot routine', () => {
        const preShotSettings = (overrides: Record<string, unknown> = {}) => ({
            notificationsEnabled: true, voice: 'female', soundsEnabled: true,
            wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false,
            homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7,
            reviewPromptShown: false, preShotReminderEnabled: true, preShotRoutineText: 'Target, breathe, go', ...overrides,
        });

        it('renders the Pre-shot routine heading and On/Off buttons', () => {
            mockGetSettingsService.mockReturnValue(preShotSettings());
            const { getByText, getByTestId } = render(<Settings />);

            expect(getByText('Show pre-shot routine')).toBeTruthy();
            expect(getByTestId('preshot-on')).toBeTruthy();
            expect(getByTestId('preshot-off')).toBeTruthy();
        });

        it('shows On selected and the routine text input when enabled', () => {
            mockGetSettingsService.mockReturnValue(preShotSettings());
            const { getByTestId } = render(<Settings />);

            expect(getByTestId('preshot-on-selected')).toBeTruthy();
            expect(getByTestId('preshot-routine-input').props.value).toBe('Target, breathe, go');
        });

        it('hides the routine text input when disabled', () => {
            mockGetSettingsService.mockReturnValue(preShotSettings({ preShotReminderEnabled: false }));
            const { getByTestId, queryByTestId } = render(<Settings />);

            expect(getByTestId('preshot-off-selected')).toBeTruthy();
            expect(queryByTestId('preshot-routine-input')).toBeNull();
        });

        it('saves preShotReminderEnabled false when Off pressed', async () => {
            mockGetSettingsService.mockReturnValue(preShotSettings());
            const { getByTestId } = render(<Settings />);

            fireEvent.press(getByTestId('preshot-off'));

            await waitFor(() => {
                expect(mockSaveSettingsService).toHaveBeenCalledWith(
                    expect.objectContaining({ preShotReminderEnabled: false })
                );
            });
        });

        it('saves the edited routine text on end editing', async () => {
            mockGetSettingsService.mockReturnValue(preShotSettings());
            const { getByTestId } = render(<Settings />);

            fireEvent.changeText(getByTestId('preshot-routine-input'), 'My new routine');
            fireEvent(getByTestId('preshot-routine-input'), 'endEditing');

            await waitFor(() => {
                expect(mockSaveSettingsService).toHaveBeenCalledWith(
                    expect.objectContaining({ preShotRoutineText: 'My new routine' })
                );
            });
        });
    });

    describe('Onboarding', () => {
        it('shows the onboarding overlay when not seen before', () => {
            mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7, settingsOnboardingSeen: false });

            const { getByTestId, getByText } = render(<Settings />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
            expect(getByText('Settings guide')).toBeTruthy();
        });

        it('hides the onboarding overlay when already seen', () => {
            mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7, settingsOnboardingSeen: true });

            const { queryByTestId } = render(<Settings />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('shows the onboarding overlay when the info button is pressed', () => {
            mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7, settingsOnboardingSeen: true });

            const { getByTestId, queryByTestId } = render(<Settings />);
            expect(queryByTestId('onboarding-overlay')).toBeNull();

            fireEvent.press(getByTestId('settings-info-button'));

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('saves settingsOnboardingSeen true when dismissed', async () => {
            mockGetSettingsService.mockReturnValue({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false, practiceFrequencyDays: 7, settingsOnboardingSeen: false });

            const { getByTestId, queryByTestId } = render(<Settings />);

            fireEvent.press(getByTestId('next-button'));
            fireEvent.press(getByTestId('next-button'));
            fireEvent.press(getByTestId('done-button'));

            expect(queryByTestId('onboarding-overlay')).toBeNull();
            await waitFor(() => {
                expect(mockSaveSettingsService).toHaveBeenCalledWith(
                    expect.objectContaining({ settingsOnboardingSeen: true })
                );
            });
        });
    });
});
