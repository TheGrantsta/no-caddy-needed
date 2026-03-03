import React, { act } from 'react';
import { ScrollView } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Tempo from '../../../app/tools/tempo';

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
        mockUseAudioPlayer.mockReturnValue({
            play: jest.fn(),
            pause: jest.fn(),
            seekTo: jest.fn().mockResolvedValue(undefined),
        });
    });

    it('renders correctly with the header', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Tempo training')).toBeTruthy();
    });

    it('renders the subheading', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Swing with tempo to self organise')).toBeTruthy();
    });

    it('renders default beats per minute', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Beats per minute: 60')).toBeTruthy();
    });

    it('renders the tempo slider', () => {
        const { getByTestId } = render(<Tempo />);

        expect(getByTestId('tempo-slider')).toBeTruthy();
    });

    it('renders slow and fast labels', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('slow')).toBeTruthy();
        expect(getByText('fast')).toBeTruthy();
    });

    it('renders the explanation text', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText(/John Garrity's work/)).toBeTruthy();
    });

    it('renders the chevrons section with heading', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Why tempo training is important')).toBeTruthy();
    });

    it('renders tempo training tips', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText(/Tempo: focus on flow, and not mechanics/)).toBeTruthy();
    });

    it('renders a Play button initially', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Play')).toBeTruthy();
    });

    it('toggles to Stop when Play button is pressed', () => {
        const { getByText } = render(<Tempo />);

        fireEvent.press(getByText('Play'));

        expect(getByText('Stop')).toBeTruthy();
    });

    it('toggles back to Play when Stop button is pressed', () => {
        const { getByText } = render(<Tempo />);

        fireEvent.press(getByText('Play'));
        fireEvent.press(getByText('Stop'));

        expect(getByText('Play')).toBeTruthy();
    });

    it('updatesBeatsPerMinuteWhenSliderChanges', () => {
        const { getByTestId, getByText } = render(<Tempo />);

        fireEvent(getByTestId('tempo-slider'), 'valueChange', 120);

        expect(getByText('Beats per minute: 120')).toBeTruthy();
    });

    it('stopsLoopWhenSliderChangedWhilePlaying', () => {
        const { getByText, getByTestId } = render(<Tempo />);

        fireEvent.press(getByText('Play'));
        fireEvent(getByTestId('tempo-slider'), 'valueChange', 90);

        expect(getByText('Play')).toBeTruthy();
    });

    it('callsSeekAndPlayWhenIntervalFires', async () => {
        const mockPlayer = mockUseAudioPlayer();
        const { getByText } = render(<Tempo />);

        fireEvent.press(getByText('Play'));

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
        expect(mockPlayer.play).toHaveBeenCalled();
    });

    it('logsErrorWhenSetAudioModeAsyncRejects', async () => {
        mockSetAudioModeAsync.mockRejectedValueOnce(new Error('audio error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<Tempo />);
        await act(async () => {});

        expect(consoleSpy).toHaveBeenCalledWith('Error loading sound:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('logsErrorWhenSeekToThrows', async () => {
        const mockPlayer = mockUseAudioPlayer();
        mockPlayer.seekTo.mockRejectedValueOnce(new Error('seek error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { getByText } = render(<Tempo />);
        fireEvent.press(getByText('Play'));

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(consoleSpy).toHaveBeenCalledWith('Error playing sound:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('onRefreshShowsRefreshingOverlay', () => {
        const { UNSAFE_getByType, getByText } = render(<Tempo />);
        const scrollView = UNSAFE_getByType(ScrollView);

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        expect(getByText('Release to update')).toBeTruthy();
    });

    it('onRefreshHidesOverlayAfterTimeout', () => {
        const { UNSAFE_getByType, queryByText } = render(<Tempo />);
        const scrollView = UNSAFE_getByType(ScrollView);

        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(queryByText('Release to update')).toBeNull();
    });

    it('onRefreshResetsTempoTo60', () => {
        const { UNSAFE_getByType, getByTestId, getByText } = render(<Tempo />);

        fireEvent(getByTestId('tempo-slider'), 'valueChange', 120);
        expect(getByText('Beats per minute: 120')).toBeTruthy();

        const scrollView = UNSAFE_getByType(ScrollView);
        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });
        act(() => {
            jest.runAllTimers();
        });

        expect(getByText('Beats per minute: 60')).toBeTruthy();
    });

    it('onRefreshSetsIsPlayingFalse', async () => {
        const { UNSAFE_getByType, getByText } = render(<Tempo />);

        fireEvent.press(getByText('Play'));
        expect(getByText('Stop')).toBeTruthy();

        const scrollView = UNSAFE_getByType(ScrollView);
        act(() => {
            scrollView.props.refreshControl.props.onRefresh();
        });

        // Only advance to 750ms to fire the refresh timeout without triggering
        // the repeating 1000ms interval (which would cause an infinite loop).
        await act(async () => {
            jest.advanceTimersByTime(750);
        });

        expect(getByText('Play')).toBeTruthy();
    });
});
