import React from 'react';
import { Image } from 'react-native';
import { render, act, fireEvent } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { initialize } from '../../database/db';
import { useTheme } from '../../context/ThemeContext';

import RootLayout from '../../app/_layout';

jest.mock('expo-font', () => ({
    useFonts: jest.fn().mockReturnValue([true, null]),
}));

jest.mock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
    hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../database/db', () => ({
    initialize: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-toast-notifications', () => ({
    ToastProvider: jest.fn(({ children }: { children: React.ReactNode }) => <>{children}</>),
}));

jest.mock('../../context/ThemeContext', () => ({
    AppThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useTheme: jest.fn().mockReturnValue({
        theme: 'dark',
        colours: { primary: '#2D5A3D', background: '#25292e' },
    }),
}));

jest.mock('../../components/NetworkStatus', () => {
    const { View } = require('react-native');
    return function MockNetworkStatus() {
        return <View testID="network-status" />;
    };
});

jest.mock('../../components/ErrorBoundary', () => {
    const ErrorBoundaryMock = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    return ErrorBoundaryMock;
});

jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    const StackScreen = jest.fn(() => null);
    const Stack = ({ children }: { children: React.ReactNode }) => (
        <View testID="stack">{children}</View>
    );
    Stack.Screen = StackScreen;
    return {
        Stack,
        Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

jest.mock('expo-status-bar', () => ({
    StatusBar: () => null,
}));

jest.mock('@react-navigation/native', () => ({
    DarkTheme: {},
    DefaultTheme: {},
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

const mockInitialize = initialize as jest.Mock;
const mockHideAsync = SplashScreen.hideAsync as jest.Mock;
const mockUseTheme = useTheme as jest.Mock;

describe('RootLayout', () => {
    // Capture the notification handler registered at module-load time before
    // beforeEach clears mock call history.
    let notificationHandlerConfig: any;

    beforeAll(() => {
        const notifications = require('expo-notifications');
        notificationHandlerConfig = (notifications.setNotificationHandler as jest.Mock).mock.calls[0]?.[0];
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Restore the default dark theme after clearAllMocks wipes the impl.
        mockUseTheme.mockReturnValue({
            theme: 'dark',
            colours: { primary: '#2D5A3D', background: '#25292e' },
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    async function renderReady() {
        const result = render(<RootLayout />);
        // Flush microtasks up to the setTimeout registration
        await act(async () => { });
        // Fire the timer, then flush the remaining promise chain
        await act(async () => {
            jest.runAllTimers();
        });
        return result;
    }

    it('returnsNullWhileAppIsInitialising', () => {
        const { toJSON } = render(<RootLayout />);
        expect(toJSON()).toBeNull();
    });

    it('callsInitializeOnMount', async () => {
        await renderReady();
        expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    it('hidesSplashScreenAfterSetup', async () => {
        await renderReady();
        expect(mockHideAsync).toHaveBeenCalledTimes(1);
    });

    it('rendersNetworkStatusWhenReady', async () => {
        const { getByTestId } = await renderReady();
        expect(getByTestId('network-status')).toBeTruthy();
    });

    it('rendersStackNavigatorWhenReady', async () => {
        const { getByTestId } = await renderReady();
        expect(getByTestId('stack')).toBeTruthy();
    });

    it('configuresAllNamedRoutesInStack', async () => {
        const { Stack } = require('expo-router');
        await renderReady();
        const names = Stack.Screen.mock.calls.map((call: any[]) => call[0].name);
        expect(names).toContain('(tabs)');
        expect(names).toContain('+not-found');
        expect(names).toContain('settings');
        expect(names).toContain('play/scorecard');
        expect(names).toContain('short-game/putting');
        expect(names).toContain('short-game/chipping');
        expect(names).toContain('short-game/pitching');
        expect(names).toContain('short-game/bunker');
        expect(names).toContain('tools/random');
        expect(names).toContain('tools/tempo');
        expect(names).toContain('play/distances');
        expect(names).toContain('play/wedge-chart');
        expect(names).toContain('play/deadly-sin-trend');
    });

    it('doesNotRenderAppContentBeforeInitialisation', () => {
        const { queryByTestId } = render(<RootLayout />);
        expect(queryByTestId('network-status')).toBeNull();
        expect(queryByTestId('stack')).toBeNull();
    });

    it('handleNotificationReturnsCorrectAlertConfig', async () => {
        expect(notificationHandlerConfig).toBeDefined();
        const result = await notificationHandlerConfig.handleNotification();
        expect(result).toEqual({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        });
    });

    it('logoTitleRendersAnImage', async () => {
        const { Stack } = require('expo-router');
        await renderReady();

        const firstScreen = Stack.Screen.mock.calls[0][0];
        const { UNSAFE_getAllByType } = render(firstScreen.options.headerTitle());
        expect(UNSAFE_getAllByType(Image).length).toBeGreaterThan(0);
    });

    it('allRouteHeaderTitleCallbacksReturnElement', async () => {
        const { Stack } = require('expo-router');
        await renderReady();

        for (const call of Stack.Screen.mock.calls) {
            const result = call[0].options.headerTitle();
            expect(result).toBeTruthy();
        }
    });

    it('tabsHeaderRightCallbackRendersElement', async () => {
        const { Stack } = require('expo-router');
        await renderReady();

        const tabsCall = Stack.Screen.mock.calls.find((call: any[]) => call[0].name === '(tabs)');
        const result = tabsCall[0].options.headerRight();
        expect(result).toBeTruthy();
    });

    it('logsWarningWhenPrepareAppFails', async () => {
        mockInitialize.mockRejectedValueOnce(new Error('init failed'));
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        await renderReady();

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('rendersWithLightTheme', async () => {
        mockUseTheme.mockReturnValueOnce({
            theme: 'light',
            colours: { primary: '#2D5A3D', background: '#25292e' },
        });

        const { getByTestId } = await renderReady();
        expect(getByTestId('stack')).toBeTruthy();
    });

    describe('ToastProvider renderType', () => {
        async function getToastRenderType() {
            const { ToastProvider } = require('react-native-toast-notifications');
            await renderReady();
            const calls = (ToastProvider as jest.Mock).mock.calls;
            return calls[calls.length - 1][0].renderType;
        }

        it('successRenderTypeShowsMessage', async () => {
            const renderType = await getToastRenderType();
            const { getByText } = render(renderType.success({ message: 'Test message', onHide: jest.fn() }));
            expect(getByText('Test message')).toBeTruthy();
        });

        it('successRenderTypeShowsCloseButton', async () => {
            const renderType = await getToastRenderType();
            const { getByTestId } = render(renderType.success({ message: 'Test', onHide: jest.fn() }));
            expect(getByTestId('toast-close-button')).toBeTruthy();
        });

        it('successCloseButtonCallsOnHide', async () => {
            const renderType = await getToastRenderType();
            const mockOnHide = jest.fn();
            const { getByTestId } = render(renderType.success({ message: 'Test', onHide: mockOnHide }));
            fireEvent.press(getByTestId('toast-close-button'));
            expect(mockOnHide).toHaveBeenCalled();
        });

        it('dangerRenderTypeShowsCloseButton', async () => {
            const renderType = await getToastRenderType();
            const { getByTestId } = render(renderType.danger({ message: 'Error', onHide: jest.fn() }));
            expect(getByTestId('toast-close-button')).toBeTruthy();
        });

        it('dangerCloseButtonCallsOnHide', async () => {
            const renderType = await getToastRenderType();
            const mockOnHide = jest.fn();
            const { getByTestId } = render(renderType.danger({ message: 'Error', onHide: mockOnHide }));
            fireEvent.press(getByTestId('toast-close-button'));
            expect(mockOnHide).toHaveBeenCalled();
        });
    });
});
