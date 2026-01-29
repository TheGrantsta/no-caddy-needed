import React from 'react';
import { render } from '@testing-library/react-native';
import Tempo from '../../../app/tools/tempo';

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

jest.mock('expo-av', () => ({
    Audio: {
        setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
        Sound: {
            createAsync: jest.fn().mockResolvedValue({
                sound: {
                    playAsync: jest.fn(),
                    replayAsync: jest.fn(),
                    stopAsync: jest.fn(),
                    unloadAsync: jest.fn(),
                },
            }),
        },
    },
}));

jest.mock('@react-native-community/slider', () => {
    const { View } = require('react-native');
    const MockSlider = (props: any) => <View testID="tempo-slider" {...props} />;
    MockSlider.displayName = 'MockSlider';
    return MockSlider;
});

describe('Tempo training page', () => {
    it('renders correctly with the header', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Tempo training')).toBeTruthy();
    });

    it('renders the subheading', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Swing with tempo to self organise')).toBeTruthy();
    });

    it('renders tempo label', () => {
        const { getByText } = render(<Tempo />);

        expect(getByText('Tempo:')).toBeTruthy();
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

        expect(getByText(/Focus on tempo, and not mechanics/)).toBeTruthy();
    });
});
