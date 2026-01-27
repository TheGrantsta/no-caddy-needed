import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import TabLayout from '../../app/(tabs)/_layout';
import Homepage from '../../app/(tabs)/index';

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
import { TouchableOpacity, View, Text } from 'react-native';
const MockPressable = ({ children, testID, onPress }: any) => (
    <TouchableOpacity testID={testID} onPress={onPress}>
        {children}
    </TouchableOpacity>
);

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
    return ({ children }: { children: React.ReactNode }) => <>{children}</>;
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

        it('renders On course tab with correct title', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-on-course')).toBeTruthy();
            expect(getByTestId('tab-title-on-course').props.children).toBe('On course');
        });

        it('renders Settings tab with correct title', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-settings')).toBeTruthy();
            expect(getByTestId('tab-title-settings').props.children).toBe('Settings');
        });

        it('renders all four tabs', () => {
            const { getByTestId } = render(<TabLayout />);

            expect(getByTestId('tab-index')).toBeTruthy();
            expect(getByTestId('tab-practice')).toBeTruthy();
            expect(getByTestId('tab-on-course')).toBeTruthy();
            expect(getByTestId('tab-settings')).toBeTruthy();
        });
    });

    describe('Homepage Navigation Links', () => {
        it('renders Practice navigation link', () => {
            const { getByTestId } = render(<Homepage />);

            expect(getByTestId('link-/practice')).toBeTruthy();
        });

        it('renders On course navigation link', () => {
            const { getByTestId } = render(<Homepage />);

            expect(getByTestId('link-/on-course')).toBeTruthy();
        });

        it('displays Practice link with correct label', () => {
            const { getByText } = render(<Homepage />);

            expect(getByText('Practice')).toBeTruthy();
        });

        it('displays On course link with correct label', () => {
            const { getByText } = render(<Homepage />);

            expect(getByText('On course')).toBeTruthy();
        });
    });
});
