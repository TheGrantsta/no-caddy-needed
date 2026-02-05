import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import { AppThemeProvider, useTheme, useThemeColours } from '../../context/ThemeContext';
import { darkColours, lightColours } from '../../assets/colours';
import { getSettingsService, saveSettingsService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn(() => ({ theme: 'dark', notificationsEnabled: true })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

const TestConsumer = () => {
    const { theme, colours, toggleTheme, setTheme } = useTheme();
    return (
        <>
            <Text testID="theme">{theme}</Text>
            <Text testID="bg">{colours.background}</Text>
            <Pressable testID="toggle" onPress={toggleTheme} />
            <Pressable testID="set-light" onPress={() => setTheme('light')} />
            <Pressable testID="set-dark" onPress={() => setTheme('dark')} />
        </>
    );
};

const ColoursConsumer = () => {
    const colours = useThemeColours();
    return <Text testID="colours-bg">{colours.background}</Text>;
};

describe('ThemeContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true });
        mockSaveSettingsService.mockResolvedValue(true);
    });

    it('provides dark theme by default when DB returns dark', () => {
        const { getByTestId } = render(
            <AppThemeProvider>
                <TestConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('theme').props.children).toBe('dark');
        expect(getByTestId('bg').props.children).toBe(darkColours.background);
    });

    it('provides light theme when DB returns light', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'light', notificationsEnabled: true });

        const { getByTestId } = render(
            <AppThemeProvider>
                <TestConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('theme').props.children).toBe('light');
        expect(getByTestId('bg').props.children).toBe(lightColours.background);
    });

    it('toggleTheme switches from dark to light', async () => {
        const { getByTestId } = render(
            <AppThemeProvider>
                <TestConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('theme').props.children).toBe('dark');

        await act(async () => {
            fireEvent.press(getByTestId('toggle'));
        });

        expect(getByTestId('theme').props.children).toBe('light');
        expect(getByTestId('bg').props.children).toBe(lightColours.background);
    });

    it('toggleTheme switches from light to dark', async () => {
        mockGetSettingsService.mockReturnValue({ theme: 'light', notificationsEnabled: true });

        const { getByTestId } = render(
            <AppThemeProvider>
                <TestConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('theme').props.children).toBe('light');

        await act(async () => {
            fireEvent.press(getByTestId('toggle'));
        });

        expect(getByTestId('theme').props.children).toBe('dark');
        expect(getByTestId('bg').props.children).toBe(darkColours.background);
    });

    it('setTheme persists to DB', async () => {
        const { getByTestId } = render(
            <AppThemeProvider>
                <TestConsumer />
            </AppThemeProvider>
        );

        await act(async () => {
            fireEvent.press(getByTestId('set-light'));
        });

        expect(mockSaveSettingsService).toHaveBeenCalledWith({
            theme: 'light',
            notificationsEnabled: true,
        });
    });

    it('toggleTheme persists to DB', async () => {
        const { getByTestId } = render(
            <AppThemeProvider>
                <TestConsumer />
            </AppThemeProvider>
        );

        await act(async () => {
            fireEvent.press(getByTestId('toggle'));
        });

        expect(mockSaveSettingsService).toHaveBeenCalledWith({
            theme: 'light',
            notificationsEnabled: true,
        });
    });

    it('useThemeColours returns the current colour palette', () => {
        const { getByTestId } = render(
            <AppThemeProvider>
                <ColoursConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('colours-bg').props.children).toBe(darkColours.background);
    });

    it('useThemeColours updates when theme changes', async () => {
        const { getByTestId } = render(
            <AppThemeProvider>
                <TestConsumer />
                <ColoursConsumer />
            </AppThemeProvider>
        );

        expect(getByTestId('colours-bg').props.children).toBe(darkColours.background);

        await act(async () => {
            fireEvent.press(getByTestId('toggle'));
        });

        expect(getByTestId('colours-bg').props.children).toBe(lightColours.background);
    });
});
