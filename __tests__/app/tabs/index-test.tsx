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
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
    useFocusEffect: (callback: () => void) => {
        const { useEffect } = require('react');
        useEffect(callback, [callback]);
    },
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: { expoConfig: { version: '2.0.17' } },
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn(),
    saveSettingsService: jest.fn().mockResolvedValue(true),
    getAllRoundHistoryService: jest.fn(() => []),
    getAllDrillHistoryService: jest.fn(() => []),
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
    whatsNewVersionSeen: '2.0.17',
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
        expect(getByText('Smarter play & practice')).toBeTruthy();
    });

    it('displaysAStartARoundButton', () => {
        const { getByTestId, getByText } = render(<HomeScreen />);
        expect(getByText('Start a round')).toBeTruthy();
        expect(getByTestId('home-start-round')).toBeTruthy();
    });

    it('displaysTheQuickToolTiles', () => {
        const { getByTestId, getByText } = render(<HomeScreen />);
        expect(getByText('QUICK TOOLS')).toBeTruthy();
        expect(getByTestId('home-tool-wind')).toBeTruthy();
        expect(getByTestId('home-tool-tempo')).toBeTruthy();
        expect(getByTestId('home-tool-random')).toBeTruthy();
    });

    it('displaysAnEmptyRecentListWhenThereIsNoHistory', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('RECENT')).toBeTruthy();
        expect(getByText('Nothing recent yet')).toBeTruthy();
    });

    it('displaysTheLatestRoundButNoPracticeActivityInRecent', () => {
        const { getAllRoundHistoryService, getAllDrillHistoryService } = require('../../../service/DbService');
        const today = new Date().toISOString();
        getAllRoundHistoryService.mockReturnValueOnce([{ Id: 1, CourseName: 'Stats Flow Test Course', HolesPlayed: 9, StartTime: today }]);
        getAllDrillHistoryService.mockReturnValueOnce([{ Id: 1, Name: 'Short-Putting Ladder', Score: 15, Timestamp: today, Created_At: '09/11' }]);

        const { getByText, queryByText } = render(<HomeScreen />);

        expect(getByText('Stats Flow Test Course')).toBeTruthy();
        expect(getByText('Round · 9 holes · Today')).toBeTruthy();
        expect(queryByText('Practice · Score 15 · Today')).toBeNull();
    });

    it('displaysGolfSimplifiedChevrons', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Golf, simplified')).toBeTruthy();
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

    it('doesNotShowAnInfoButtonOnThePage', () => {
        const { queryByTestId } = render(<HomeScreen />);
        expect(queryByTestId('info-button')).toBeNull();
    });
    it('dismissOnboardingHidesOverlay', async () => {
        const { getByTestId, queryByTestId } = render(<HomeScreen />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();

        await act(async () => {
            fireEvent.press(getByTestId('done-button'));
        });

        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('dismissOnboardingCallsSaveSettingsWithHomeOnboardingSeenTrue', async () => {
        const { getByTestId } = render(<HomeScreen />);

        await act(async () => {
            fireEvent.press(getByTestId('done-button'));
        });

        expect(mockSaveSettingsService).toHaveBeenCalledWith(
            expect.objectContaining({ homeOnboardingSeen: true })
        );
    });

    describe('pull to refresh', () => {
        it('shouldNotOfferPullToRefreshOnHome', () => {
            const { UNSAFE_getByType } = render(<HomeScreen />);

            expect(UNSAFE_getByType(ScrollView).props.refreshControl).toBeUndefined();
        });

        it('shouldNotShowReleaseToUpdateBannerOnHome', () => {
            const { queryByText } = render(<HomeScreen />);

            expect(queryByText('Release to update')).toBeNull();
        });
    });
});
