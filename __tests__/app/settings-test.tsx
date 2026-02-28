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
    getSettingsService: jest.fn(() => ({ theme: 'dark', notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false })),
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
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });
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

    it('renders theme Light button', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('theme-light')).toBeTruthy();
    });

    it('renders theme Dark button', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('theme-dark')).toBeTruthy();
    });

    it('renders notifications On button', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('notifications-on')).toBeTruthy();
    });

    it('renders notifications Off button', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('notifications-off')).toBeTruthy();
    });

    it('shows Dark as selected by default', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('theme-dark-selected')).toBeTruthy();
    });

    it('shows Light as selected when theme is light', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'light', notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        expect(getByTestId('theme-light-selected')).toBeTruthy();
    });

    it('shows On as selected when notifications enabled', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('notifications-on-selected')).toBeTruthy();
    });

    it('shows Off as selected when notifications disabled', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        expect(getByTestId('notifications-off-selected')).toBeTruthy();
    });

    it('calls setTheme with light when Light button is pressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('theme-light'));

        await waitFor(() => {
            expect(mockSetTheme).toHaveBeenCalledWith('light');
        });
    });

    it('calls setTheme with dark when Dark button is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ theme: 'light', notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('theme-dark'));

        await waitFor(() => {
            expect(mockSetTheme).toHaveBeenCalledWith('dark');
        });
    });

    it('calls saveSettingsService with notificationsEnabled false when Off is pressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('notifications-off'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                theme: 'dark',
                notificationsEnabled: false,
                voice: 'female',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });

    it('calls saveSettingsService with notificationsEnabled true when On is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('notifications-on'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                theme: 'dark',
                notificationsEnabled: true,
                voice: 'female',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });

    it('renders Sounds heading', () => {
        const { getByText } = render(<Settings />);

        expect(getByText('Sounds')).toBeTruthy();
    });

    it('renders sounds On button', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('sounds-on')).toBeTruthy();
    });

    it('renders sounds Off button', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('sounds-off')).toBeTruthy();
    });

    it('shows On as selected by default for sounds', () => {
        const { getByTestId } = render(<Settings />);

        expect(getByTestId('sounds-on-selected')).toBeTruthy();
    });

    it('shows Off as selected when sounds disabled', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'female', soundsEnabled: false, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        expect(getByTestId('sounds-off-selected')).toBeTruthy();
    });

    it('calls saveSettingsService with soundsEnabled false when sounds Off is pressed', async () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('sounds-off'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ soundsEnabled: false })
            );
        });
    });

    it('calls saveSettingsService with soundsEnabled true when sounds On is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'female', soundsEnabled: false, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('sounds-on'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith(
                expect.objectContaining({ soundsEnabled: true })
            );
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
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'male', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        expect(getByTestId('voice-male-selected')).toBeTruthy();
    });

    it('shows Neutral as selected when settings voice is neutral', () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'neutral', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

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
                soundsEnabled: true,
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
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });

    it('calls saveSettingsService with voice female when Female is pressed', async () => {
        mockGetSettingsService.mockReturnValue({ theme: 'dark', notificationsEnabled: true, voice: 'male', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('voice-female'));

        await waitFor(() => {
            expect(mockSaveSettingsService).toHaveBeenCalledWith({
                theme: 'dark',
                notificationsEnabled: true,
                voice: 'female',
                soundsEnabled: true,
                wedgeChartOnboardingSeen: false,
                distancesOnboardingSeen: false,
                playOnboardingSeen: false,
                homeOnboardingSeen: false,
                practiceOnboardingSeen: false,
            });
        });
    });
});
