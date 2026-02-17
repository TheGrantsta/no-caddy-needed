import React from 'react';
import { render } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
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

jest.mock('expo-router', () => ({
    Tabs: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <MockPressable testID={`link-${href}`} onPress={() => mockPush(href)}>
            {children}
        </MockPressable>
    ),
    useRouter: () => ({
        push: mockPush,
        navigate: mockNavigate,
    }),
}));

// Mock Pressable for Link testing
const MockPressable = ({ children, testID, onPress }: any) => (
    <TouchableOpacity testID={testID} onPress={onPress}>
        {children}
    </TouchableOpacity>
);

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
}));

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
jest.mock('../../app/screen-wrapper', () => {
    const ScreenWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    ScreenWrapper.displayName = 'ScreenWrapper';
    return ScreenWrapper;
});

// Mock Tabs.Screen to capture tab configuration
jest.mock('expo-router', () => {
    const React = require('react');
    const { View, Text } = require('react-native');

    const TabsScreen = ({ name, options }: { name: string; options: any }) => (
        <View testID={`tab-${name}`}>
            <Text testID={`tab-title-${name}`}>{options.title}</Text>
            {options.tabBarIcon && options.tabBarIcon({ color: '#ffd33d' })}
        </View>
    );

    const Tabs = ({ children, screenOptions }: { children: React.ReactNode; screenOptions: any }) => (
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

        it('renders Perform tab with correct title', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-perform')).toBeTruthy();
            expect(getByTestId('tab-title-perform').props.children).toBe('Perform');
        });

        it('renders all four tabs', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-index')).toBeTruthy();
            expect(getByTestId('tab-play')).toBeTruthy();
            expect(getByTestId('tab-practice')).toBeTruthy();
            expect(getByTestId('tab-perform')).toBeTruthy();
        });
    });

    describe('Homepage Navigation Links', () => {
        it('renders Play navigation link', () => {
            const { getByTestId } = render(<Homepage />);

            expect(getByTestId('link-/play')).toBeTruthy();
        });

        it('renders Practice navigation link', () => {
            const { getByTestId } = render(<Homepage />);

            expect(getByTestId('link-/practice')).toBeTruthy();
        });

        it('renders Perform navigation link', () => {
            const { getByTestId } = render(<Homepage />);

            expect(getByTestId('link-/perform')).toBeTruthy();
        });

        it('displays Play link with correct label', () => {
            const { getByText } = render(<Homepage />);

            expect(getByText('Play')).toBeTruthy();
        });

        it('displays Practice link with correct label', () => {
            const { getByText } = render(<Homepage />);

            expect(getByText('Practice')).toBeTruthy();
        });

        it('displays Perform link with correct label', () => {
            const { getByText } = render(<Homepage />);

            expect(getByText('Perform')).toBeTruthy();
        });
    });
});
