import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Settings from '../../app/settings';
import { getSettingsService, saveSettingsService } from '../../service/DbService';

const mockSetTheme = jest.fn();

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: mockSetTheme,
    }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
}));

jest.mock('../../service/DbService', () => ({
    getSettingsService: jest.fn(() => ({ theme: 'dark', notificationsEnabled: true })),
    saveSettingsService: jest.fn(() => Promise.resolve(true)),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
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

describe('Settings page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true });
        mockSaveSettingsService.mockResolvedValue(true);
    });

    it('renders page title', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Settings')).toBeTruthy();
    });

    it('renders theme heading', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Theme')).toBeTruthy();
    });

    it('renders notifications heading', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Notifications')).toBeTruthy();
    });

    it('renders theme toggle', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('theme-toggle')).toBeTruthy();
    });

    it('renders notifications toggle', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('notifications-toggle')).toBeTruthy();
    });

    it('shows dark theme label when theme is dark', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Dark')).toBeTruthy();
    });

    it('shows light theme label when theme is light', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'light', notificationsEnabled: true });

        const { getByText } = render(<Settings />);

        expect(getByText('Light')).toBeTruthy();
    });

    it('shows on label when notifications enabled', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('On')).toBeTruthy();
    });

    it('shows off label when notifications disabled', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: false });

        const { getByText } = render(<Settings />);

        expect(getByText('Off')).toBeTruthy();
    });

    it('calls setTheme when theme toggle is pressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(getByTestId('theme-toggle'), 'valueChange', true);

        await waitFor(() => {
            expect(mockSetTheme).toHaveBeenCalledWith('light');
        });
    });

    it('calls saveSettingsService when notifications toggle is pressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(getByTestId('notifications-toggle'), 'valueChange', false);

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                theme: 'dark',
                notificationsEnabled: false,
            });
        });
    });
});
