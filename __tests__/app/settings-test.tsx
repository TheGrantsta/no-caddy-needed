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
    getSettingsService: jest.fn(() => ({ theme: 'dark', notificationsEnabled: true, voice: 'female', wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false })),
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
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'female', wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });
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
        mockGetSettingsService.mockReturnValue({ theme: 'light', notificationsEnabled: true, voice: 'female', wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByText } = render(<Settings />);

        expect(getByText('Light')).toBeTruthy();
    });

    it('shows on label when notifications enabled', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('On')).toBeTruthy();
    });

    it('shows off label when notifications disabled', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: false, voice: 'female', wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

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
                voice: 'female',
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });

    it('renders Voice heading', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Voice')).toBeTruthy();
    });

    it('renders Female voice option', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('voice-female')).toBeTruthy();
    });

    it('renders Male voice option', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('voice-male')).toBeTruthy();
    });

    it('renders Neutral voice option', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('voice-neutral')).toBeTruthy();
    });

    it('shows Female as selected by default', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('voice-female-selected')).toBeTruthy();
    });

    it('shows Male as selected when settings voice is male', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'male', wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        expect(getByTestId('voice-male-selected')).toBeTruthy();
    });

    it('shows Neutral as selected when settings voice is neutral', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'neutral', wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        expect(getByTestId('voice-neutral-selected')).toBeTruthy();
    });

    it('calls saveSettingsService with voice male when Male is pressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('voice-male'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                theme: 'dark',
                notificationsEnabled: true,
                voice: 'male',
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });

    it('calls saveSettingsService with voice neutral when Neutral is pressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('voice-neutral'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                theme: 'dark',
                notificationsEnabled: true,
                voice: 'neutral',
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });

    it('calls saveSettingsService with voice female when Female is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'male', wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('voice-female'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                theme: 'dark',
                notificationsEnabled: true,
                voice: 'female',
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });
});
