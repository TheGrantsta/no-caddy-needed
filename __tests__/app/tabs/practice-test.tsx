import React, { act } from 'react';
import { FlatList, ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import Practice from '../../../app/(tabs)/practice';
import {
    getSettingsService,
    saveSettingsService,
    getAllDrillHistoryService,
    getDrillStatsByTypeService,
} from '../../../service/DbService';

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
    Link: ({ children }: any) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn(),
    saveSettingsService: jest.fn().mockResolvedValue(true),
    getAllDrillHistoryService: jest.fn().mockReturnValue([]),
    getDrillStatsByTypeService: jest.fn().mockReturnValue([]),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;
const mockGetAllDrillHistoryService = getAllDrillHistoryService as jest.Mock;
const mockGetDrillStatsByTypeService = getDrillStatsByTypeService as jest.Mock;

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

describe('Practice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(defaultSettings);
        mockGetAllDrillHistoryService.mockReturnValue([]);
        mockGetDrillStatsByTypeService.mockReturnValue([]);
    });

    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<Practice />);
        expect(toJSON()).toBeTruthy();
    });

    it('displaysHeaderText', () => {
        const { getAllByText } = render(<Practice />);
        expect(getAllByText('Practice').length).toBeGreaterThan(0);
    });

    it('displaysSubheaderText', () => {
        const { getByText } = render(<Practice />);
        expect(getByText('Make your practice time more effective')).toBeTruthy();
    });

    it('showsShortGameSectionByDefault', () => {
        const { getByText } = render(<Practice />);
        expect(getByText('Short game practice')).toBeTruthy();
    });

    it('displaysPuttingInShortGameSection', () => {
        const { getByText } = render(<Practice />);
        expect(getByText('Putting')).toBeTruthy();
    });

    it('displaysChippingInShortGameSection', () => {
        const { getByText } = render(<Practice />);
        expect(getByText('Chipping')).toBeTruthy();
    });

    it('displaysPitchingInShortGameSection', () => {
        const { getByText } = render(<Practice />);
        expect(getByText('Pitching')).toBeTruthy();
    });

    it('displaysBunkerPlayInShortGameSection', () => {
        const { getByText } = render(<Practice />);
        expect(getByText('Bunker play')).toBeTruthy();
    });

    it('displaysPrinciplesChevrons', () => {
        const { getByText } = render(<Practice />);
        expect(getByText('Principles')).toBeTruthy();
    });

    it('showsToolsSectionWhenToolsSubMenuPressed', () => {
        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-tools'));
        expect(getByText('Practice tools')).toBeTruthy();
    });

    it('displaysTempoInToolsSection', () => {
        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-tools'));
        expect(getByText('Tempo')).toBeTruthy();
    });

    it('displaysRandomInToolsSection', () => {
        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-tools'));
        expect(getByText('Random')).toBeTruthy();
    });

    it('showsNoDrillHistoryWhenEmpty', () => {
        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-history'));
        expect(getByText('No drill history yet')).toBeTruthy();
    });

    it('showsDrillHistoryTextWhenDataExists', () => {
        mockGetAllDrillHistoryService.mockReturnValue([
            { Name: 'Putting drill', Result: 1, Created_At: '2024-01-01' },
            { Name: 'Chipping drill', Result: 0, Created_At: '2024-01-02' },
        ]);

        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-history'));
        expect(getByText('Drill History')).toBeTruthy();
    });

    it('logsErrorWhenFetchDataFails', () => {
        mockGetAllDrillHistoryService.mockImplementation(() => {
            throw new Error('DB error');
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Practice />);

        expect(consoleSpy).toHaveBeenCalledWith('Error fetching drill history:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('historyFlatListOnScrollDoesNotThrow', () => {
        mockGetAllDrillHistoryService.mockReturnValue(
            Array.from({ length: 6 }, (_, i) => ({ Name: `Drill ${i}`, Result: 1, Created_At: '2024-01-01' }))
        );

        const { getByTestId, UNSAFE_getAllByType } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-history'));

        const flatLists = UNSAFE_getAllByType(FlatList);
        expect(() => {
            act(() => {
                flatLists[0].props.onScroll({ nativeEvent: { contentOffset: { x: 375 } } });
            });
        }).not.toThrow();
    });

    it('showsOnboardingWhenPracticeOnboardingNotSeen', () => {
        const { getByTestId } = render(<Practice />);
        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('hidesOnboardingWhenPracticeOnboardingSeen', () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, practiceOnboardingSeen: true });
        const { queryByTestId } = render(<Practice />);
        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('infoButtonShowsOnboarding', () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, practiceOnboardingSeen: true });
        const { getByTestId, queryByTestId } = render(<Practice />);

        expect(queryByTestId('onboarding-overlay')).toBeNull();

        fireEvent.press(getByTestId('info-button'));

        expect(getByTestId('onboarding-overlay')).toBeTruthy();
    });

    it('dismissOnboardingHidesOverlay', async () => {
        const { getByTestId, queryByTestId } = render(<Practice />);

        expect(getByTestId('onboarding-overlay')).toBeTruthy();

        await act(async () => {
            fireEvent.press(getByTestId('skip-button'));
        });

        expect(queryByTestId('onboarding-overlay')).toBeNull();
    });

    it('dismissOnboardingCallsSaveSettingsWithPracticeOnboardingSeenTrue', async () => {
        const { getByTestId } = render(<Practice />);

        await act(async () => {
            fireEvent.press(getByTestId('skip-button'));
        });

        expect(mockSaveSettingsService).toHaveBeenCalledWith(
            expect.objectContaining({ practiceOnboardingSeen: true })
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
            const { UNSAFE_getByType, getByText } = render(<Practice />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });

            expect(getByText('Release to update')).toBeTruthy();
        });

        it('onRefreshHidesOverlayAfterTimeout', () => {
            const { UNSAFE_getByType, queryByText } = render(<Practice />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(queryByText('Release to update')).toBeNull();
        });

        it('onRefreshCallsFetchData', () => {
            const { UNSAFE_getByType } = render(<Practice />);
            const scrollView = UNSAFE_getByType(ScrollView);

            const initialCallCount = mockGetAllDrillHistoryService.mock.calls.length;

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(mockGetAllDrillHistoryService.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
    });
});
