import React, { act } from 'react';
import { ScrollView } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Tempo from '../../../app/tools/tempo';
import { getSettingsService, saveSettingsService } from '../../../service/DbService';

const mockSetOptions = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useNavigation: () => ({ setOptions: mockSetOptions }),
    useRouter: () => ({ back: mockBack }),
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn(),
    saveSettingsService: jest.fn().mockResolvedValue(true),
}));

const mockGetSettings = getSettingsService as jest.Mock;
const mockSaveSettings = saveSettingsService as jest.Mock;
const settingsWith = (tempoBpm: number) => ({ tempoBpm });

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
    useStyles: () => require('../../../assets/styles').default,
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

jest.mock('expo-audio', () => ({
    useAudioPlayer: jest.fn().mockReturnValue({
        play: jest.fn(),
        pause: jest.fn(),
        seekTo: jest.fn().mockResolvedValue(undefined),
    }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-community/slider', () => {
    const { View } = require('react-native');
    const MockSlider = (props: any) => <View testID="tempo-slider" {...props} />;
    MockSlider.displayName = 'MockSlider';
    return MockSlider;
});

jest.useFakeTimers();

const mockUseAudioPlayer = useAudioPlayer as jest.Mock;
const mockSetAudioModeAsync = setAudioModeAsync as jest.Mock;

describe('Tempo training page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        mockGetSettings.mockReturnValue(settingsWith(60));
        mockSaveSettings.mockResolvedValue(true);
        mockUseAudioPlayer.mockReturnValue({
            play: jest.fn(),
            pause: jest.fn(),
            seekTo: jest.fn().mockResolvedValue(undefined),
        });
    });

    it('showsTheTitleAndSubtitleInThePage', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Tempo training')).toBeTruthy();
        expect(getByText('Swing with tempo to self organise')).toBeTruthy();
    });

    it('keepsTheStackHeaderSoTheGreenBarAndNativeBackAreShown', () => {
        render(<Tempo />);

        expect(mockSetOptions).not.toHaveBeenCalledWith(expect.objectContaining({ headerShown: false }));
    });

    it('doesNotDrawItsOwnBackButtonBecauseTheHeaderProvidesOne', () => {
        const { queryByLabelText } = render(<Tempo />);

        expect(queryByLabelText('Back')).toBeNull();
    });

    it('showsTheSavedTempoAsTheLargeReadoutWithItsUnit', () => {
        mockGetSettings.mockReturnValue(settingsWith(84));
        const { getByTestId, getByText } = render(<Tempo />);

        expect(getByTestId('tempo-bpm-value').props.children).toBe(84);
        expect(getByText('beats per minute')).toBeTruthy();
    });

    it('defaultsTheReadoutToSixtyWhenNoTempoIsSaved', () => {
        mockGetSettings.mockReturnValue(settingsWith(60));
        const { getByTestId } = render(<Tempo />);

        expect(getByTestId('tempo-bpm-value').props.children).toBe(60);
    });

    it('saves the current tempo when Play is pressed', () => {
        mockGetSettings.mockReturnValue(settingsWith(96));
        const { getByLabelText } = render(<Tempo />);

        fireEvent.press(getByLabelText('Play'));

        expect(mockSaveSettings).toHaveBeenCalledWith(
            expect.objectContaining({ tempoBpm: 96 })
        );
    });

    it('does not save the tempo when Stop is pressed', () => {
        mockGetSettings.mockReturnValue(settingsWith(96));
        const { getByLabelText } = render(<Tempo />);

        fireEvent.press(getByLabelText('Play'));
        mockSaveSettings.mockClear();
        fireEvent.press(getByLabelText('Stop'));

        expect(mockSaveSettings).not.toHaveBeenCalled();
    });

    it('renders the tempo slider', () => {
        const { getByTestId } = render(<Tempo />);

        expect(getByTestId('tempo-slider')).toBeTruthy();
    });

    it('configuresSliderForSixBeatsPerMinuteStops', () => {
        const { getByTestId } = render(<Tempo />);
        const slider = getByTestId('tempo-slider');

        expect(slider.props.minimumValue).toBe(60);
        expect(slider.props.maximumValue).toBe(120);
        expect(slider.props.step).toBe(6);
    });

    it('rendersSlowAndFastLabelsBesideTheSlider', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Slow')).toBeTruthy();
        expect(getByText('Fast')).toBeTruthy();
    });

    it('decreasesTempoBySixAndStopsAtSixty', () => {
        mockGetSettings.mockReturnValue(settingsWith(66));
        const { getByTestId } = render(<Tempo />);

        fireEvent.press(getByTestId('tempo-decrease-button'));
        expect(getByTestId('tempo-bpm-value').props.children).toBe(60);

        fireEvent.press(getByTestId('tempo-decrease-button'));
        expect(getByTestId('tempo-bpm-value').props.children).toBe(60);
    });

    it('increasesTempoBySixAndStopsAtOneTwenty', () => {
        mockGetSettings.mockReturnValue(settingsWith(114));
        const { getByTestId } = render(<Tempo />);

        fireEvent.press(getByTestId('tempo-increase-button'));
        expect(getByTestId('tempo-bpm-value').props.children).toBe(120);

        fireEvent.press(getByTestId('tempo-increase-button'));
        expect(getByTestId('tempo-bpm-value').props.children).toBe(120);
    });

    it('showsFourBeatIndicatorDotsWithNoneActiveWhenStopped', () => {
        const { getByTestId } = render(<Tempo />);

        for (let beat = 0; beat < 4; beat++) {
            expect(getByTestId(`tempo-beat-${beat}`)).toHaveStyle({ backgroundColor: '#D9D9D9' });
        }
    });

    it('highlightsEachBeatInTurnWhileTheMetronomePlays', async () => {
        const { getByLabelText, getByTestId } = render(<Tempo />);

        fireEvent.press(getByLabelText('Play'));

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(getByTestId('tempo-beat-0')).toHaveStyle({ backgroundColor: '#2D5A3D' });

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(getByTestId('tempo-beat-1')).toHaveStyle({ backgroundColor: '#2D5A3D' });
        expect(getByTestId('tempo-beat-0')).toHaveStyle({ backgroundColor: '#D9D9D9' });
    });

    it('showsWhyTempoIsImportantWithItsThreeLabelledRows', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('WHY TEMPO IS IMPORTANT')).toBeTruthy();
        expect(getByText('Focus')).toBeTruthy();
        expect(getByText('Flow, not mechanics')).toBeTruthy();
        expect(getByText('Fault')).toBeTruthy();
        expect(getByText('Misconception')).toBeTruthy();
    });

    it('rendersAPlayButtonInitially', () => {
        const { getByLabelText } = render(<Tempo />);

        expect(getByLabelText('Play')).toBeTruthy();
    });

    it('togglesToStopWhenPlayIsPressed', () => {
        const { getByLabelText } = render(<Tempo />);

        fireEvent.press(getByLabelText('Play'));

        expect(getByLabelText('Stop')).toBeTruthy();
    });

    it('togglesBackToPlayWhenStopIsPressed', () => {
        const { getByLabelText } = render(<Tempo />);

        fireEvent.press(getByLabelText('Play'));
        fireEvent.press(getByLabelText('Stop'));

        expect(getByLabelText('Play')).toBeTruthy();
    });

    it('updatesTheReadoutWhenSliderChanges', () => {
        const { getByTestId } = render(<Tempo />);

        fireEvent(getByTestId('tempo-slider'), 'valueChange', 120);

        expect(getByTestId('tempo-bpm-value').props.children).toBe(120);
    });

    it('stopsLoopWhenSliderChangedWhilePlaying', () => {
        const { getByLabelText, getByTestId } = render(<Tempo />);

        fireEvent.press(getByLabelText('Play'));
        fireEvent(getByTestId('tempo-slider'), 'valueChange', 90);

        expect(getByLabelText('Play')).toBeTruthy();
    });

    it('callsSeekAndPlayWhenIntervalFires', async () => {
        const mockPlayer = mockUseAudioPlayer();
        const { getByLabelText } = render(<Tempo />);

        fireEvent.press(getByLabelText('Play'));

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
        expect(mockPlayer.play).toHaveBeenCalled();
    });

    it('logsErrorWhenSetAudioModeAsyncRejects', async () => {
        mockSetAudioModeAsync.mockRejectedValueOnce(new Error('audio error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Tempo />);
        await act(async () => { });

        expect(consoleSpy).toHaveBeenCalledWith('Error loading sound:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('logsErrorWhenSeekToThrows', async () => {
        const mockPlayer = mockUseAudioPlayer();
        mockPlayer.seekTo.mockRejectedValueOnce(new Error('seek error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const { getByLabelText } = render(<Tempo />);
        fireEvent.press(getByLabelText('Play'));

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(consoleSpy).toHaveBeenCalledWith('Error playing sound:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('shouldNotOfferPullToRefreshSoTempoIsNotResetByScrolling', () => {
        const { UNSAFE_getByType } = render(<Tempo />);

        expect(UNSAFE_getByType(ScrollView).props.refreshControl).toBeUndefined();
    });

    it('requestsBackgroundPlaybackSoTheBeatContinuesWhenAppIsBackgrounded', () => {
        render(<Tempo />);
        expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
            expect.objectContaining({ shouldPlayInBackground: true })
        );
    });
});
