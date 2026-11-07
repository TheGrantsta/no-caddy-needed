import React from 'react';
import { render } from '@testing-library/react-native';
import TabLayout from '../../app/(tabs)/_layout';
import { getPracticeRemindersService } from '../../service/DbService';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

const mockUseSegments = jest.fn().mockReturnValue(['(tabs)', 'practice']);
const mockNavigate = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    Tabs: Object.assign(
        jest.fn(({ children }: any) => <>{children}</>),
        {
            Screen: jest.fn(({ options }: any) => {
                const colours = require('../../assets/colours').default;
                if (options?.tabBarIcon) {
                    const icon = options.tabBarIcon({ color: colours.primary, focused: false });
                    const React = require('react');
                    return React.isValidElement(icon) ? icon : null;
                }
                return null;
            }),
        }
    ),
    useSegments: () => mockUseSegments(),
    useRouter: () => ({ navigate: mockNavigate, push: mockPush }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../components/ScreenWrapper', () => {
    const ScreenWrapper = ({ children }: any) => <>{children}</>;
    return ScreenWrapper;
});

jest.mock('../../service/DbService', () => ({
    getPracticeRemindersService: jest.fn().mockReturnValue([]),
}));

const mockGetPracticeRemindersService = getPracticeRemindersService as jest.Mock;

describe('Tabs layout — Practice overdue badge', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPracticeRemindersService.mockReturnValue([]);
    });

    it('shouldShowOverdueBadgeOnPracticeTabWhenReminderIsOverdue', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2020-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2019-12-31T09:00:00.000Z' }
        ]);
        const { getByTestId } = render(<TabLayout />);
        expect(getByTestId('practice-overdue-badge')).toBeTruthy();
    });

    it('shouldNotShowOverdueBadgeWhenNoRemindersAreOverdue', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2099-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2026-03-12T09:00:00.000Z' }
        ]);
        const { queryByTestId } = render(<TabLayout />);
        expect(queryByTestId('practice-overdue-badge')).toBeNull();
    });

    it('shouldNotShowOverdueBadgeWhenRemindersListIsEmpty', () => {
        const { queryByTestId } = render(<TabLayout />);
        expect(queryByTestId('practice-overdue-badge')).toBeNull();
    });

    it('shouldNotShowActiveIndicatorWhenFocused', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const colours = require('../../assets/colours').default;
        const firstCall = (Tabs.Screen as jest.Mock).mock.calls[0];
        const icon = firstCall[0].options.tabBarIcon({ color: colours.primary, focused: true });
        const { queryByTestId } = render(icon);
        expect(queryByTestId('tab-active-indicator')).toBeNull();
    });

    it('shouldShowTheSelectedTabTextAndIconInPrimaryGreen', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const activeTint = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarActiveTintColor;
        expect(activeTint).toBe(require('../../assets/colours').default.primary);
    });

    it('shouldShowTheSelectedTabAsALightTintPillNotASolidBlock', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const activeBackground = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarActiveBackgroundColor;
        expect(activeBackground).not.toBe(require('../../assets/colours').default.primary);
        expect(activeBackground).toMatch(/^#2D5A3D[0-9A-Fa-f]{2}$/);
    });

    it('shouldInsetTheSelectedPillWithinTheBarWithRoundedCorners', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const itemStyle = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarItemStyle;
        expect(itemStyle.borderRadius).toBeGreaterThan(0);
        expect(itemStyle.marginHorizontal).toBeGreaterThan(0);
        expect(itemStyle.marginBottom).toBeUndefined();
    });

    it('shouldRenderTheBarAsAFloatingRoundedPillInsetFromTheScreenEdges', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const barStyle = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarStyle;
        expect(barStyle.position).toBe('absolute');
        expect(barStyle.borderRadius).toBeGreaterThanOrEqual(24);
        expect(barStyle.left).toBe(16);
        expect(barStyle.right).toBe(16);
        expect(barStyle.backgroundColor).toBe(require('../../assets/colours').default.backgroundLight);
    });

    it('shouldGiveEachTabEnoughHeightForIconAndLabelSoNeitherIsClipped', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const { screenOptions } = (Tabs as jest.Mock).mock.calls[0][0];
        const availableHeight = screenOptions.tabBarStyle.height - 2 * screenOptions.tabBarItemStyle.marginVertical;
        // 28pt icon + label line + the tab's own default item padding
        expect(availableHeight).toBeGreaterThanOrEqual(60);
    });

    it('shouldPaintTheTabScenesWithTheAppBackgroundNotTheNavigationDarkThemeBlack', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const sceneStyle = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.sceneStyle;
        expect(sceneStyle.backgroundColor).toBe(require('../../assets/colours').default.background);
    });

    it('shouldSizeEachTabPillToFillTheBarHeightSoItCoversIconAndLabel', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const { screenOptions } = (Tabs as jest.Mock).mock.calls[0][0];
        expect(screenOptions.tabBarItemStyle.height).toBeGreaterThanOrEqual(56);
    });

    it('shouldRoundTheSelectedTabIntoACircleOrPillAtHalfItsHeight', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const { screenOptions } = (Tabs as jest.Mock).mock.calls[0][0];
        expect(screenOptions.tabBarItemStyle.borderRadius).toBeGreaterThanOrEqual(screenOptions.tabBarItemStyle.height / 2);
    });

    it('shouldClipTheSelectedHighlightToTheRoundedTabShape', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const { screenOptions } = (Tabs as jest.Mock).mock.calls[0][0];
        expect(screenOptions.tabBarItemStyle.overflow).toBe('hidden');
    });

    it('shouldReserveSpaceAboveTheFloatingBarSoScreenContentIsNotHiddenBehindIt', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const sceneStyle = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.sceneStyle;
        expect(sceneStyle.paddingBottom).toBeGreaterThanOrEqual(90);
    });

    it('shouldUseMutedTabInactiveColourSoTheSelectedTabStandsOut', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const inactiveTint = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarInactiveTintColor;
        expect(inactiveTint).toBe(require('../../assets/colours').default.tabInactive);
    });

    it('shouldUseLoopIconForPracticeTab', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const practiceScreen = (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === 'practice');
        const icon = practiceScreen[0].options.tabBarIcon({ color: '#4A9068', focused: false });
        const { getByText } = render(icon);
        expect(getByText(/Icon: loop/)).toBeTruthy();
    });

    it('shouldUseBarChartIconForPerformanceTab', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const performScreen = (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === 'perform');
        const icon = performScreen[0].options.tabBarIcon({ color: '#4A9068', focused: false });
        const { getByText } = render(icon);
        expect(getByText(/Icon: bar-chart/)).toBeTruthy();
    });

    it('shouldUseIconSizeMatchingTheDesign', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const firstCall = (Tabs.Screen as jest.Mock).mock.calls[0];
        const icon = firstCall[0].options.tabBarIcon({ color: '#4A9068', focused: false });
        const { getByText } = render(icon);
        expect(getByText(/Size: 28/)).toBeTruthy();
    });

    it('shouldUseSmallLabelFontSizeMatchingTheDesign', () => {
        render(<TabLayout />);
        const { Tabs } = require('expo-router');
        const labelStyle = (Tabs as jest.Mock).mock.calls[0][0].screenOptions.tabBarLabelStyle;
        expect(labelStyle.fontSize).toBe(11);
    });

    it('shouldClearOverdueBadgeWhenOverdueReminderIsDeleted', () => {
        mockGetPracticeRemindersService.mockReturnValue([
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2020-01-01T08:00:00.000Z', NotificationId: 'n1', Created_At: '2019-12-31T09:00:00.000Z' }
        ]);
        const { getByTestId, queryByTestId, rerender } = render(<TabLayout />);
        expect(getByTestId('practice-overdue-badge')).toBeTruthy();

        mockGetPracticeRemindersService.mockReturnValue([]);
        mockUseSegments.mockReturnValue(['(tabs)', 'practice']);
        rerender(<TabLayout />);

        expect(queryByTestId('practice-overdue-badge')).toBeNull();
    });

    describe('Practice tab press', () => {
        it('shouldNotRedirectToRemindersWhenPracticeTabPressedWhileOverdue', () => {
            const { Tabs } = require('expo-router');
            render(<TabLayout />);
            const practiceScreen = (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === 'practice');

            expect(practiceScreen[0].listeners).toBeUndefined();
        });
    });


    describe('tab order and labels', () => {
        it('shouldUseGolfBallIconForPlayTab', () => {
            render(<TabLayout />);
            const { Tabs } = require('expo-router');
            const playScreen = (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === 'play');
            const icon = playScreen[0].options.tabBarIcon({ color: '#4A9068', focused: false });
            const { getByText } = render(icon);

            expect(getByText(/Icon: golf-outline/)).toBeTruthy();
        });

        const tabNamesInOrder = () => {
            const { Tabs } = require('expo-router');
            render(<TabLayout />);
            return (Tabs.Screen as jest.Mock).mock.calls.map((call: any) => call[0].name);
        };

        it('shouldShowHomePlayMyBagPracticeAndStatsTabsInThatOrder', () => {
            expect(tabNamesInOrder()).toEqual(['index', 'play', 'my-bag', 'practice', 'perform']);
        });

        it('shouldLabelThePerformanceRouteTabAsStats', () => {
            render(<TabLayout />);
            const { Tabs } = require('expo-router');
            const performScreen = (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === 'perform');

            expect(performScreen[0].options.title).toBe('Stats');
        });

        it('shouldLabelTheMyBagTab', () => {
            render(<TabLayout />);
            const { Tabs } = require('expo-router');
            const myBagScreen = (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === 'my-bag');

            expect(myBagScreen[0].options.title).toBe('My Bag');
        });

        it('shouldUseGolfBagStyleIconForMyBagTab', () => {
            render(<TabLayout />);
            const { Tabs } = require('expo-router');
            const myBagScreen = (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === 'my-bag');
            const icon = myBagScreen[0].options.tabBarIcon({ color: '#4A9068', focused: false });
            const { getByText } = render(icon);

            expect(getByText(/Icon: backpack/)).toBeTruthy();
        });
    });

    describe('tab button test ids', () => {
        it('shouldGiveEachTabButtonAStableTestIdForEndToEndTests', () => {
            const { Tabs } = require('expo-router');
            render(<TabLayout />);

            const testIdFor = (name: string) =>
                (Tabs.Screen as jest.Mock).mock.calls.find((call: any) => call[0].name === name)[0].options.tabBarButtonTestID;

            expect(testIdFor('index')).toBe('tab-home');
            expect(testIdFor('play')).toBe('tab-play');
            expect(testIdFor('my-bag')).toBe('tab-my-bag');
            expect(testIdFor('practice')).toBe('tab-practice');
            expect(testIdFor('perform')).toBe('tab-perform');
        });
    });
});
