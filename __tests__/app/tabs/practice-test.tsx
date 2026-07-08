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
import { logEvent } from '../../../service/FirebaseService';

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

jest.mock('../../../service/FirebaseService', () => ({
    logEvent: jest.fn().mockResolvedValue(true),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;
const mockGetAllDrillHistoryService = getAllDrillHistoryService as jest.Mock;
const mockGetDrillStatsByTypeService = getDrillStatsByTypeService as jest.Mock;
const mockLogEvent = logEvent as jest.Mock;

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
        expect(getByText('Practice areas')).toBeTruthy();
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

    it('displaysWindInToolsSection', () => {
        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-tools'));
        expect(getByText('Wind')).toBeTruthy();
    });

    it('showsNoDrillHistoryWhenEmpty', () => {
        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-history'));
        expect(getByText('No test history yet')).toBeTruthy();
    });

    it('showsDrillHistoryTextWhenDataExists', () => {
        mockGetAllDrillHistoryService.mockReturnValue([
            { Name: 'Putting drill', Result: 1, Score: 5, Created_At: '2024-01-01' },
            { Name: 'Chipping drill', Result: 0, Score: 2, Created_At: '2024-01-02' },
        ]);

        const { getByTestId, getByText } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-history'));
        expect(getByText('Putting drill')).toBeTruthy();
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

    it('scrollViewScrollDoesNotThrow', () => {
        mockGetAllDrillHistoryService.mockReturnValue(
            Array.from({ length: 6 }, (_, i) => ({ Name: `Drill ${i}`, Result: 1, Created_At: '2024-01-01' }))
        );

        const { getByTestId, UNSAFE_getByType } = render(<Practice />);
        fireEvent.press(getByTestId('practice-sub-menu-history'));

        const scrollView = UNSAFE_getByType(ScrollView);
        expect(() => {
            act(() => {
                scrollView.props.onScroll({
                    nativeEvent: {
                        contentOffset: { y: 0 },
                        contentSize: { height: 1000 },
                        layoutMeasurement: { height: 100 }
                    }
                });
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

    describe('Analytics tracking', () => {
        it('logs view_tools when Tools sub-menu tab pressed', () => {
            const { getByTestId } = render(<Practice />);

            fireEvent.press(getByTestId('practice-sub-menu-tools'));

            expect(mockLogEvent).toHaveBeenCalledWith('view_tools');
        });

        it('logs view_history when History sub-menu tab pressed', () => {
            const { getByTestId } = render(<Practice />);

            fireEvent.press(getByTestId('practice-sub-menu-history'));

            expect(mockLogEvent).toHaveBeenCalledWith('view_history');
        });

        it('logs view_areas when Areas sub-menu tab pressed', () => {
            const { getByTestId } = render(<Practice />);

            fireEvent.press(getByTestId('practice-sub-menu-tools'));
            mockLogEvent.mockClear();

            fireEvent.press(getByTestId('practice-sub-menu-areas'));

            expect(mockLogEvent).toHaveBeenCalledWith('view_areas');
        });
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

    describe('Infinite scroll in history', () => {
        it('loadsInitial20ItemsOnFirstLoad', () => {
            const items = Array.from({ length: 50 }, (_, i) => ({
                Name: `Drill ${i}`,
                Result: 1,
                Score: 5,
                Created_At: '2024-01-01'
            }));
            mockGetAllDrillHistoryService.mockReturnValue(items);

            const { getByTestId, UNSAFE_getAllByType } = render(<Practice />);
            fireEvent.press(getByTestId('practice-sub-menu-history'));

            // Check the FlatList data directly
            const flatLists = UNSAFE_getAllByType(FlatList);
            const historyFlatList = flatLists.find(fl => fl.props.data?.length > 0 && fl.props.data[0].Name?.includes('Drill'));
            expect(historyFlatList?.props.data.length).toBe(20);
        });

        it('loadsMoreItemsWhenScrolledToNearBottom', () => {
            jest.useFakeTimers();
            const items = Array.from({ length: 50 }, (_, i) => ({
                Name: `Drill ${i}`,
                Result: 1,
                Score: 5,
                Created_At: '2024-01-01'
            }));
            mockGetAllDrillHistoryService.mockReturnValue(items);

            const { getByTestId, UNSAFE_getByType, UNSAFE_getAllByType } = render(<Practice />);
            fireEvent.press(getByTestId('practice-sub-menu-history'));

            const scrollView = UNSAFE_getByType(ScrollView);

            // Simulate scrolling to near bottom
            act(() => {
                scrollView.props.onScroll({
                    nativeEvent: {
                        contentOffset: { y: 900 },
                        contentSize: { height: 1000 },
                        layoutMeasurement: { height: 100 }
                    }
                });
            });

            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Check the FlatList data directly
            const flatLists = UNSAFE_getAllByType(FlatList);
            const historyFlatList = flatLists.find(fl => fl.props.data?.length > 0 && fl.props.data[0].Name?.includes('Drill'));
            expect(historyFlatList?.props.data.length).toBe(40);

            jest.useRealTimers();
        });

        it('showsLoadingIndicatorWhileFetchingMoreItems', () => {
            jest.useFakeTimers();
            const items = Array.from({ length: 50 }, (_, i) => ({
                Name: `Drill ${i}`,
                Result: 1,
                Score: 5,
                Created_At: '2024-01-01'
            }));
            mockGetAllDrillHistoryService.mockReturnValue(items);

            const { getByTestId, UNSAFE_getByType, queryByTestId } = render(<Practice />);
            fireEvent.press(getByTestId('practice-sub-menu-history'));

            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.onScroll({
                    nativeEvent: {
                        contentOffset: { y: 900 },
                        contentSize: { height: 1000 },
                        layoutMeasurement: { height: 100 }
                    }
                });
            });

            // Loading indicator should be visible while loading
            expect(queryByTestId('infinite-scroll-loader')).toBeTruthy();

            jest.useRealTimers();
        });

        it('stopsLoadingWhenAllItemsAreLoaded', () => {
            jest.useFakeTimers();
            const items = Array.from({ length: 25 }, (_, i) => ({
                Name: `Drill ${i}`,
                Result: 1,
                Score: 5,
                Created_At: '2024-01-01'
            }));
            mockGetAllDrillHistoryService.mockReturnValue(items);

            const { getByTestId, UNSAFE_getByType, queryByTestId } = render(<Practice />);
            fireEvent.press(getByTestId('practice-sub-menu-history'));

            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.onScroll({
                    nativeEvent: {
                        contentOffset: { y: 900 },
                        contentSize: { height: 1000 },
                        layoutMeasurement: { height: 100 }
                    }
                });
            });

            act(() => {
                jest.advanceTimersByTime(100);
            });

            // After loading, no more loader should appear
            expect(queryByTestId('infinite-scroll-loader')).toBeNull();

            jest.useRealTimers();
        });

        it('doesNotLoadMoreWhenAlreadyLoading', () => {
            jest.useFakeTimers();
            const items = Array.from({ length: 50 }, (_, i) => ({
                Name: `Drill ${i}`,
                Result: 1,
                Score: 5,
                Created_At: '2024-01-01'
            }));
            mockGetAllDrillHistoryService.mockReturnValue(items);

            const { getByTestId, UNSAFE_getByType } = render(<Practice />);
            fireEvent.press(getByTestId('practice-sub-menu-history'));

            const scrollView = UNSAFE_getByType(ScrollView);

            const initialCallCount = mockGetAllDrillHistoryService.mock.calls.length;

            act(() => {
                scrollView.props.onScroll({
                    nativeEvent: {
                        contentOffset: { y: 900 },
                        contentSize: { height: 1000 },
                        layoutMeasurement: { height: 100 }
                    }
                });
            });

            // Scroll again before the first load completes (before advancing timers)
            act(() => {
                scrollView.props.onScroll({
                    nativeEvent: {
                        contentOffset: { y: 900 },
                        contentSize: { height: 1000 },
                        layoutMeasurement: { height: 100 }
                    }
                });
            });

            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Service should only be called once (initial), since loadMoreItems prevents double-loading
            expect(mockGetAllDrillHistoryService.mock.calls.length).toBe(initialCallCount);

            jest.useRealTimers();
        });
    });
});
