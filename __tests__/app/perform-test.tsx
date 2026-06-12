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
    practiceFrequencyDays: 7,
    reviewPromptShown: false,
    preShotReminderEnabled: true,
    preShotRoutineText: '',
    whatsNewVersionSeen: '',
    settingsOnboardingSeen: true,
    performOnboardingSeen: true,
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

    describe('Approach section', () => {
        it('renders correctly with the default text', () => {
            const { getByText } = render(<View />);

            expect(getByText('Approach shots')).toBeTruthy();
            expect(getByText('Make better on course decisions & choose better targets')).toBeTruthy();
        });

        it('renders approach as the default section', () => {
            const { getByText } = render(<View />);

            expect(getByText('Concepts')).toBeTruthy();
            expect(getByText('Target: play for your shot dispersion')).toBeTruthy();
            expect(getByText('Aim: think shotgun pattern')).toBeTruthy();
            expect(getByText('Strategy: favour the "fat" side')).toBeTruthy();
            expect(getByText('Eliminate: big numbers by playing away from water & severe hazards')).toBeTruthy();
        });

        it('renders approach tendencies', () => {
            const { getByText } = render(<View />);

            expect(getByText('* Your dispersion changes with different clubs and swing types — know your tendencies for full and partial shots')).toBeTruthy();
        });
    });

    it('renders correctly with stats heading', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('perform-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Manage your expectations, better!')).toBeTruthy();
    });

    it('renders correctly with stats approach shots headings', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('perform-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Approach shots')).toBeTruthy();
        expect(getByText('Average proximity to the hole')).toBeTruthy();
    });

    it('renders correctly with stats approach shot proximity', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('perform-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Yards')).toBeTruthy();
        expect(getByText('Fairway')).toBeTruthy();
        expect(getByText('Rough')).toBeTruthy();
    });

    describe('Analytics tracking', () => {
        it('logs view_pro_stats when pro stats sub-menu tab pressed', () => {
            const { getByTestId } = render(<View />);

            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

            expect(mockLogEvent).toHaveBeenCalledWith('view_pro_stats');
        });

        it('logs view_approach when approach sub-menu tab pressed', () => {
            const { getByTestId } = render(<View />);

            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
            mockLogEvent.mockClear();

            fireEvent.press(getByTestId('perform-sub-menu-approach'));

            expect(mockLogEvent).toHaveBeenCalledWith('view_approach');
        });
    });

    it('renders correctly with stats putting make rates', async () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('perform-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        const flatList = getByTestId('perform-flat-list');

        fireEvent.scroll(flatList, {
            nativeEvent: {
                contentOffset: { x: 500, y: 0 },
                contentSize: { width: 500, height: 100 },
                layoutMeasurement: { width: 300, height: 100 }
            },
        });

        await waitFor(() => {
            expect(getByText('Feet')).toBeTruthy();
            expect(getByText('Make rate')).toBeTruthy();
            expect(getByText(/Source:/)).toBeTruthy();
        });
    });

    describe('Onboarding', () => {
        it('shows the onboarding overlay when not seen before', () => {
            mockGetSettingsService.mockReturnValue({ ...baseSettings, performOnboardingSeen: false });

            const { getByTestId, getByText } = render(<View />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
            expect(getByText('Perform guide')).toBeTruthy();
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
