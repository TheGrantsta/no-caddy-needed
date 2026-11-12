import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Random from '../../../app/tools/random';
import * as Speech from 'expo-speech';
import { getSettingsService } from '../../../service/DbService';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { getRandomNumber } from '../../../assets/random-number';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ back: mockBack }),
}));

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
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

jest.mock('../../../assets/random-number', () => ({
    getRandomNumber: jest.fn().mockReturnValue(50),
}));

jest.mock('expo-speech', () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    getAvailableVoicesAsync: jest.fn(),
}));

jest.mock('expo-speech-recognition', () => ({
    ExpoSpeechRecognitionModule: {
        requestPermissionsAsync: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
    },
    useSpeechRecognitionEvent: jest.fn(),
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn(),
}));

const mockGetSettingsService = getSettingsService as jest.Mock;
const mockGetAvailableVoicesAsync = Speech.getAvailableVoicesAsync as jest.Mock;
const mockGetRandomNumber = getRandomNumber as jest.Mock;
const mockRequestPermissions = ExpoSpeechRecognitionModule.requestPermissionsAsync as jest.Mock;
const mockStart = ExpoSpeechRecognitionModule.start as jest.Mock;
const mockStop = ExpoSpeechRecognitionModule.stop as jest.Mock;
const mockUseSpeechRecognitionEvent = useSpeechRecognitionEvent as jest.Mock;

const defaultSettings = { voice: 'female', theme: 'dark', notificationsEnabled: true, soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };

const samanthaVoice = { identifier: 'com.apple.ttsbundle.Samantha-compact', name: 'Samantha', language: 'en-US', quality: 'Default' };
const tomVoice = { identifier: 'com.apple.ttsbundle.Tom-compact', name: 'Tom', language: 'en-GB', quality: 'Default' };

describe('Random number generator page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSettingsService.mockReturnValue(defaultSettings);
        mockGetAvailableVoicesAsync.mockResolvedValue([samanthaVoice, tomVoice]);
        mockRequestPermissions.mockResolvedValue({ granted: true });
        mockUseSpeechRecognitionEvent.mockImplementation(() => { });
        jest.spyOn(console, 'debug').mockImplementation(() => { });
    });

    it('shows a back button left of the heading that returns to the previous screen', () => {
        const { getByLabelText } = render(<Random />);

        fireEvent.press(getByLabelText('Back'));

        expect(mockBack).toHaveBeenCalled();
    });

    it('renders correctly with the header', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Random number')).toBeTruthy();
    });

    it('shouldShowFromAndToInputsWithDefaultValues', () => {
        const { getByDisplayValue, getByText } = render(<Random />);

        expect(getByText('From')).toBeTruthy();
        expect(getByText('To')).toBeTruthy();
        expect(getByDisplayValue('30')).toBeTruthy();
        expect(getByDisplayValue('100')).toBeTruthy();
    });

    it('shouldGiveEachPurposeRowFullHeightWithADividerBorderNotAHeight', () => {
        const { getByTestId } = render(<Random />);

        expect(getByTestId('purpose-row-0')).not.toHaveStyle({ borderTopWidth: StyleSheet.hairlineWidth });
        expect(getByTestId('purpose-row-1')).toHaveStyle({ borderTopWidth: StyleSheet.hairlineWidth });
        expect(getByTestId('purpose-row-1').props.style.flat()).not.toEqual(expect.arrayContaining([expect.objectContaining({ height: StyleSheet.hairlineWidth })]));
    });

    it('shouldDescribeTheNumbersTheSettingsProduce', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Numbers from 30 to 100 inclusive, in steps of 10: 30, 40, 50…')).toBeTruthy();
    });

    it('shouldShowADashAsTheNumberBeforeTheFirstGenerate', () => {
        const { getByTestId } = render(<Random />);

        expect(getByTestId('random-number-value')).toHaveTextContent('–');
    });

    it('shouldShowTheTapGenerateCaptionUnderTheNumber', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Tap Generate, or turn on the mic and say “next”, to produce a number')).toBeTruthy();
    });

    it('renders increment input with default value', () => {
        const { getByDisplayValue } = render(<Random />);

        expect(getByDisplayValue('10')).toBeTruthy();
    });

    it('renders the Run button', () => {
        const { getByText } = render(<Random />);

        expect(getByText('Generate')).toBeTruthy();
    });

    it('renders purpose section with its two labelled rows', () => {
        const { getByText, queryByText } = render(<Random />);

        expect(getByText('PURPOSE')).toBeTruthy();
        expect(getByText('Realism')).toBeTruthy();
        expect(getByText('Practise like play')).toBeTruthy();
        expect(queryByText('Focus')).toBeNull();
        expect(queryByText('Use pre-shot routine')).toBeNull();
        expect(getByText('Evaluation')).toBeTruthy();
        expect(getByText('Access how well you did')).toBeTruthy();
    });

    it('shows error when From is empty and Generate is pressed', () => {
        const { getByDisplayValue, getByTestId, getByText } = render(<Random />);

        fireEvent.changeText(getByDisplayValue('30'), '');
        fireEvent.press(getByTestId('save-button'));

        expect(getByText('From cannot be empty')).toBeTruthy();
    });

    it('shows error when To is empty and Generate is pressed', () => {
        const { getByDisplayValue, getByTestId, getByText } = render(<Random />);

        fireEvent.changeText(getByDisplayValue('100'), '');
        fireEvent.press(getByTestId('save-button'));

        expect(getByText('To cannot be empty')).toBeTruthy();
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
        expect(getByTestId('random-number-value')).toHaveTextContent('50');
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

    it('does not speak when soundsEnabled is false', async () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, soundsEnabled: false });

        const { getByTestId } = render(<Random />);
        fireEvent.press(getByTestId('save-button'));

        await waitFor(() => {
            expect(Speech.speak).not.toHaveBeenCalled();
        });
    });

    it('filters non-numeric characters from From and To inputs', () => {
        const { getByDisplayValue } = render(<Random />);

        fireEvent.changeText(getByDisplayValue('30'), '2a0');
        fireEvent.changeText(getByDisplayValue('100'), '5b0');

        expect(getByDisplayValue('20')).toBeTruthy();
        expect(getByDisplayValue('50')).toBeTruthy();
    });

    it('filters non-numeric characters from increment input', () => {
        const { getByDisplayValue } = render(<Random />);

        const incrementInput = getByDisplayValue('10');
        fireEvent.changeText(incrementInput, '5abc');

        expect(getByDisplayValue('5')).toBeTruthy();
    });

    it('renders mic button in off state by default', () => {
        const { getByTestId } = render(<Random />);

        expect(getByTestId('mic-button')).toBeTruthy();
    });

    it('pressing mic button requests permissions and starts recognition', async () => {
        const { getByTestId } = render(<Random />);

        await act(async () => {
            fireEvent.press(getByTestId('mic-button'));
        });

        expect(mockRequestPermissions).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalledWith({ lang: 'en-GB', continuous: true, interimResults: true });
    });

    it('pressing mic button again stops recognition', async () => {
        const { getByTestId } = render(<Random />);

        await act(async () => {
            fireEvent.press(getByTestId('mic-button'));
        });
        await act(async () => {
            fireEvent.press(getByTestId('mic-button'));
        });

        expect(mockStop).toHaveBeenCalled();
    });

    it('does not start recognition when permission is denied', async () => {
        mockRequestPermissions.mockResolvedValue({ granted: false });
        const { getByTestId } = render(<Random />);

        await act(async () => {
            fireEvent.press(getByTestId('mic-button'));
        });

        expect(mockStart).not.toHaveBeenCalled();
    });

    it('transcript "next" triggers handleGenerate', async () => {
        let capturedResultHandler: ((event: any) => void) | null = null;
        mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
            if (eventName === 'result') capturedResultHandler = handler;
        });

        const { getByText } = render(<Random />);

        act(() => capturedResultHandler!({ results: [{ transcript: 'next' }] }));

        expect(getByText('50')).toBeTruthy();
    });

    it('transcript without trigger phrase does not trigger handleGenerate', () => {
        let capturedResultHandler: ((event: any) => void) | null = null;
        mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
            if (eventName === 'result') capturedResultHandler = handler;
        });

        const { queryByText } = render(<Random />);

        act(() => capturedResultHandler!({ results: [{ transcript: 'hello world' }] }));

        expect(queryByText('50')).toBeNull();
    });

    it('stops recognition on unmount', () => {
        const { unmount } = render(<Random />);

        unmount();

        expect(mockStop).toHaveBeenCalled();
    });

    it('result event after mic is toggled off does not trigger handleGenerate', async () => {
        let capturedResultHandler: ((event: any) => void) | null = null;
        mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
            if (eventName === 'result') capturedResultHandler = handler;
        });

        const { getByTestId } = render(<Random />);

        await act(async () => {
            fireEvent.press(getByTestId('mic-button'));
        });

        act(() => capturedResultHandler!({ results: [{ transcript: 'next' }] }));

        await act(async () => {
            fireEvent.press(getByTestId('mic-button'));
        });

        act(() => capturedResultHandler!({ results: [{ transcript: 'next' }] }));

        expect(mockGetRandomNumber).toHaveBeenCalledTimes(1);
    });

    it('two separate "next" utterances each trigger handleGenerate', () => {
        let capturedResultHandler: ((event: any) => void) | null = null;
        mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
            if (eventName === 'result') capturedResultHandler = handler;
        });

        render(<Random />);

        act(() => capturedResultHandler!({ results: [{ transcript: 'next' }] }));
        act(() => capturedResultHandler!({ results: [{ transcript: 'okay' }] }));
        act(() => capturedResultHandler!({ results: [{ transcript: 'next' }] }));

        expect(mockGetRandomNumber).toHaveBeenCalledTimes(2);
    });

    it('clearsFromErrorWhenUserTypesAfterError', () => {
        const { getByDisplayValue, getByTestId, queryByText } = render(<Random />);

        fireEvent.changeText(getByDisplayValue('30'), '');
        fireEvent.press(getByTestId('save-button'));

        fireEvent.changeText(getByDisplayValue(''), '20');

        expect(queryByText('From cannot be empty')).toBeNull();
    });

    it('clearsIncrementErrorWhenUserTypesAfterError', () => {
        const { getByDisplayValue, getByTestId, queryByText } = render(<Random />);

        fireEvent.changeText(getByDisplayValue('10'), '');
        fireEvent.press(getByTestId('save-button'));

        fireEvent.changeText(getByDisplayValue(''), '5');

        expect(queryByText('Increment cannot be empty')).toBeNull();
    });

    it('speechRecognitionHandlesNullTranscript', () => {
        let capturedResultHandler: ((event: any) => void) | null = null;
        mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
            if (eventName === 'result') capturedResultHandler = handler;
        });

        render(<Random />);

        expect(() => act(() => capturedResultHandler!({ results: [{ transcript: null }] }))).not.toThrow();
    });

    it('stopsPreviousSpeechBeforeGeneratingNewNumber', async () => {
        mockGetSettingsService.mockReturnValue({ ...defaultSettings, soundsEnabled: true });
        mockGetAvailableVoicesAsync.mockResolvedValue([]);
        const { getByTestId } = render(<Random />);

        await act(async () => { fireEvent.press(getByTestId('save-button')); });
        await act(async () => { fireEvent.press(getByTestId('save-button')); });

        expect(Speech.stop).toHaveBeenCalled();
    });

    describe('pull to refresh', () => {
        it('shouldNotOfferPullToRefreshSoRandomNumberIsNotResetByScrolling', () => {
            const { UNSAFE_getByType } = render(<Random />);

            expect(UNSAFE_getByType(ScrollView).props.refreshControl).toBeUndefined();
        });
    });

    describe('microphone permission denied', () => {
        it('shouldExplainMicrophoneIsOffWhenPermissionDenied', async () => {
            mockRequestPermissions.mockResolvedValueOnce({ granted: false });
            const { getByTestId, getByText } = render(<Random />);

            await act(async () => {
                fireEvent.press(getByTestId('mic-button'));
            });

            expect(getByText('Microphone access is off; turn it on in Settings')).toBeTruthy();
        });
    });
});
