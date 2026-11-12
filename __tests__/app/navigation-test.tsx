import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import TabLayout from '../../app/(tabs)/_layout';
import Homepage from '../../app/(tabs)/index';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

// Mock expo-router
const mockPush = jest.fn();
const mockNavigate = jest.fn();


jest.mock('../../hooks/useOrientation', () => ({
    useOrientation: () => ({
        isLandscape: false,
        isPortrait: true,
        landscapePadding: {},
    }),
}));

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
        homeOnboardingSeen: true,
        practiceOnboardingSeen: true,
    }),
    saveSettingsService: jest.fn().mockResolvedValue(true),
    getPracticeRemindersService: jest.fn().mockReturnValue([]),
    getAllRoundHistoryService: jest.fn(() => []),
    getAllDrillHistoryService: jest.fn(() => []),
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

// Mock the screen wrapper
jest.mock('../../components/ScreenWrapper', () => {
    const ScreenWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    ScreenWrapper.displayName = 'ScreenWrapper';
    return ScreenWrapper;
});

// Mock Tabs.Screen to capture tab configuration
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => {
    const React = require('react');
    const { View, Text } = require('react-native');

    const TabsScreen = ({ name, options }: { name: string; options: any }) => (
        <View testID={`tab-${name}`}>
            <Text testID={`tab-title-${name}`}>{options.title}</Text>
            {options.tabBarIcon && options.tabBarIcon({ color: '#ffd33d' })}
        </View>
    );

    const Tabs = ({ children, _screenOptions }: { children: React.ReactNode; screenOptions: any }) => (
        <View testID="tab-bar">
            {children}
        </View>
    );

    Tabs.Screen = TabsScreen;

    return {
        Tabs,
        Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
            <View testID={`link-${href}`}>
                {children}
            </View>
        ),
        useSegments: () => ['(tabs)', 'practice'],
        useRouter: () => ({
            push: mockPush,
            navigate: mockNavigate,
        }),
        useLocalSearchParams: () => ({}),
        useFocusEffect: (callback: () => void) => {
            React.useEffect(callback, [callback]);
        },
    };
});

describe('Main Navigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Tab Layout', () => {
        it('renders the tab bar', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-bar')).toBeTruthy();
        });

        it('renders Home tab with correct title', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-index')).toBeTruthy();
            expect(getByTestId('tab-title-index').props.children).toBe('Home');
        });

        it('renders Practice tab with correct title', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-practice')).toBeTruthy();
            expect(getByTestId('tab-title-practice').props.children).toBe('Practice');
        });

        it('renders Play tab with correct title', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-play')).toBeTruthy();
            expect(getByTestId('tab-title-play').props.children).toBe('Play');
        });

        it('renders Stats tab with correct title', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-perform')).toBeTruthy();
            expect(getByTestId('tab-title-perform').props.children).toBe('Stats');
        });

        it('renders all five tabs', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-index')).toBeTruthy();
            expect(getByTestId('tab-play')).toBeTruthy();
            expect(getByTestId('tab-my-bag')).toBeTruthy();
            expect(getByTestId('tab-practice')).toBeTruthy();
            expect(getByTestId('tab-perform')).toBeTruthy();
        });
    });

    describe('Homepage Navigation Links', () => {
        it('opens Play from the Start a round button', () => {
            const { getByTestId } = render(<Homepage />);

            fireEvent.press(getByTestId('home-start-round'));

            expect(mockPush).toHaveBeenCalledWith('/play');
        });

        it('renders the quick tool tiles', () => {
            const { getByTestId } = render(<Homepage />);

            expect(getByTestId('home-tool-wind')).toBeTruthy();
            expect(getByTestId('home-tool-tempo')).toBeTruthy();
            expect(getByTestId('home-tool-random')).toBeTruthy();
        });

        it('displays the Start a round label', () => {
            const { getByText } = render(<Homepage />);

            expect(getByText('Start a round')).toBeTruthy();
        });
    });
});
