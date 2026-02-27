import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

jest.mock('expo-av', () => ({
    Audio: {
        setAudioModeAsync: jest.fn().mockReturnValue(new Promise(() => { })),
        Sound: {
            createAsync: jest.fn().mockReturnValue(new Promise(() => { })),
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
});
