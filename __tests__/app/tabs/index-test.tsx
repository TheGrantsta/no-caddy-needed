import React, { act } from 'react';
import { ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import HomeScreen from '../../../app/(tabs)/index';
import { getSettingsService, saveSettingsService } from '../../../service/DbService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: () => ({ landscapePadding: {} }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('expo-router', () => ({
    Link: ({ children, testID }: any) => {
        const { View } = require('react-native');
        return <View testID={testID}>{children}</View>;
    },
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn(),
    saveSettingsService: jest.fn().mockResolvedValue(true),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

const defaultSettings = {
    theme: 'dark',
    notificationsEnabled: true,
    voice: 'female',
    soundsEnabled: true,
    wedgeChartOnboardingSeen: false,
    distancesOnboardingSeen: false,
    playOnboardingSeen: false,
    homeOnboardingSeen: false,
    practiceOnboardingSeen: false,
};

describe('HomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(defaultSettings);
    });

    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<HomeScreen />);
        expect(toJSON()).toBeTruthy();
    });

    it('displaysHeaderText', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('No caddy needed!')).toBeTruthy();
    });

    it('displaysSubheaderText', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Smarter play, practice & performance')).toBeTruthy();
    });

    it('displaysPlayNavLink', () => {
        const { getByTestId } = render(<HomeScreen />);
        expect(getByTestId('home-play-link')).toBeTruthy();
    });

    it('displaysPracticeNavLink', () => {
        const { getByTestId } = render(<HomeScreen />);
        expect(getByTestId('home-practice-link')).toBeTruthy();
    });

    it('displaysPerformNavLink', () => {
        const { getByTestId } = render(<HomeScreen />);
        expect(getByTestId('home-perform-link')).toBeTruthy();
    });

    it('displaysGolfSimplifiedChevrons', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Golf simplified')).toBeTruthy();
    });

    it('displaysBestCaddyText', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Be your own best caddy')).toBeTruthy();
    });

    it('showsOnboardingWhenNotSeenBefore', () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, homeOnboardingSeen: false });
        const { getByTestId } = render(<HomeScreen />);
        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('hidesOnboardingWhenAlreadySeen', () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, homeOnboardingSeen: true });
        const { queryByTestId } = render(<HomeScreen />);
        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('infoButtonShowsOnboarding', () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, homeOnboardingSeen: true });
        const { getByTestId, queryByTestId } = render(<HomeScreen />);

        expect(queryByTestId('onboarding-overlay')).toBeNull();

        fireEvent.press(getByTestId('info-button'));

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('dismissOnboardingHidesOverlay', async () => {
        const { getByTestId, queryByTestId } = render(<HomeScreen />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();

        await act(async () => {
            fireEvent.press(getByTestId('skip-button'));
        });

        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('dismissOnboardingCallsSaveSettingsWithHomeOnboardingSeenTrue', async () => {
        const { getByTestId } = render(<HomeScreen />);

        await act(async () => {
            fireEvent.press(getByTestId('skip-button'));
        });

        expect(mockSaveSettingsService).toHaveBeenCalledWith(
            expect.objectContaining({ homeOnboardingSeen: true })
        );
    });

    describe('onRefresh', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        it('onRefreshShowsRefreshingOverlay', () => {
            const { UNSAFE_getByType, getByText } = render(<HomeScreen />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });

            expect(getByText('Release to update')).toBeTruthy();
        });

        it('onRefreshHidesOverlayAfterTimeout', () => {
            const { UNSAFE_getByType, queryByText } = render(<HomeScreen />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(queryByText('Release to update')).toBeNull();
        });
    });
});
