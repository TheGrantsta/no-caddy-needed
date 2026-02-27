import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Random from '../../../app/tools/random';
import * as Speech from 'expo-speech';
import { getSettingsService } from '../../../service/DbService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/stlyes').default,
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

jest.mock('../../../assets/random-number', () => ({
    getRandomNumber: jest.fn().mockReturnValue(50),
}));

jest.mock('expo-speech', () => ({
    speak: jest.fn(),
    getAvailableVoicesAsync: jest.fn(),
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn(),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockGetAvailableVoicesAsync = Speech.getAvailableVoicesAsync as jest.Mock;

const defaultSettings = { voice: 'female', theme: 'dark', notificationsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };

const samanthaVoice = { identifier: 'com.apple.ttsbundle.Samantha-compact', name: 'Samantha', language: 'en-US', quality: 'Default' };
const tomVoice = { identifier: 'com.apple.ttsbundle.Tom-compact', name: 'Tom', language: 'en-US', quality: 'Default' };

describe('Random number generator page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(defaultSettings);
        mockGetAvailableVoicesAsync.mockResolvedValue([samanthaVoice, tomVoice]);
    });

    it('renders correctly with the header', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Random number generator')).toBeTruthy();
    });

    it('renders range input with default value', () => {
        const { getByDisplayValue } = render(<Random />);

        expect(getByDisplayValue('30-100')).toBeTruthy();
    });

    it('renders increment input with default value', () => {
        const { getByDisplayValue } = render(<Random />);

        expect(getByDisplayValue('10')).toBeTruthy();
    });

    it('renders the Run button', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Generate')).toBeTruthy();
    });

    it('renders purpose section with chevrons', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Purpose')).toBeTruthy();
        expect(getByText('Random: mimic play when practising')).toBeTruthy();
        expect(getByText('Focus: use your pre-shot routine')).toBeTruthy();
        expect(getByText('Evaluate: use your post-shot routine')).toBeTruthy();
    });

    it('shows error when range is empty and Run is pressed', () => {
        const { getByDisplayValue, getByTestId, getByText } = render(<Random />);

        const rangeInput = getByDisplayValue('30-100');
        fireEvent.changeText(rangeInput, '');

        const runButton = getByTestId('save-button');
        fireEvent.press(runButton);

        expect(getByText('Range cannot be empty')).toBeTruthy();
    });

    it('shows error when increment is empty and Run is pressed', () => {
        const { getByDisplayValue, getByTestId, getByText } = render(<Random />);

        const incrementInput = getByDisplayValue('10');
        fireEvent.changeText(incrementInput, '');

        const runButton = getByTestId('save-button');
        fireEvent.press(runButton);

        expect(getByText('Increment cannot be empty')).toBeTruthy();
    });

    it('displays random number after pressing Run with valid inputs', () => {
        const { getByTestId, getByText } = render(<Random />);

        const runButton = getByTestId('save-button');
        fireEvent.press(runButton);

        expect(getByText('50')).toBeTruthy();
    });

    it('speaks with female voice identifier when Samantha is available', async () => {
        const { getByTestId } = render(<Random />);
        fireEvent.press(getByTestId('save-button'));

        await waitFor(() => {
            expect(Speech.speak).toHaveBeenCalledWith('50', { voice: samanthaVoice.identifier });
        });
    });

    it('speaks with male voice identifier when voice is male and Tom is available', async () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, voice: 'male' });

        const { getByTestId } = render(<Random />);
        fireEvent.press(getByTestId('save-button'));

        await waitFor(() => {
            expect(Speech.speak).toHaveBeenCalledWith('50', { voice: tomVoice.identifier });
        });
    });

    it('speaks with no voice options when voice is neutral', async () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, voice: 'neutral' });

        const { getByTestId } = render(<Random />);
        fireEvent.press(getByTestId('save-button'));

        await waitFor(() => {
            expect(Speech.speak).toHaveBeenCalledWith('50', {});
        });
    });

    it('falls back to higher pitch when voice is female and no female voice available', async () => {
        mockGetAvailableVoicesAsync.mockResolvedValue([tomVoice]);

        const { getByTestId } = render(<Random />);
        fireEvent.press(getByTestId('save-button'));

        await waitFor(() => {
            expect(Speech.speak).toHaveBeenCalledWith('50', { pitch: 1.5 });
        });
    });

    it('falls back to lower pitch when voice is male and no male voice available', async () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, voice: 'male' });
        mockGetAvailableVoicesAsync.mockResolvedValue([samanthaVoice]);

        const { getByTestId } = render(<Random />);
        fireEvent.press(getByTestId('save-button'));

        await waitFor(() => {
            expect(Speech.speak).toHaveBeenCalledWith('50', { pitch: 0.5 });
        });
    });

    it('filters non-numeric characters from range input except hyphen', () => {
        const { getByDisplayValue } = render(<Random />);

        const rangeInput = getByDisplayValue('30-100');
        fireEvent.changeText(rangeInput, '20-abc50');

        expect(getByDisplayValue('20-50')).toBeTruthy();
    });

    it('filters non-numeric characters from increment input', () => {
        const { getByDisplayValue } = render(<Random />);

        const incrementInput = getByDisplayValue('10');
        fireEvent.changeText(incrementInput, '5abc');

        expect(getByDisplayValue('5')).toBeTruthy();
    });
});
