import React from 'react';
import { render } from '@testing-library/react-native';
import Random from '../../../app/tools/random';

jest.mock('expo-speech-recognition', () => {
    throw new Error('Cannot find native module ExpoSpeechRecognition');
});

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
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('expo-speech', () => ({
    speak: jest.fn(),
    getAvailableVoicesAsync: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../assets/random-number', () => ({
    getRandomNumber: jest.fn().mockReturnValue(50),
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn().mockReturnValue({
        voice: 'female',
        theme: 'dark',
        notificationsEnabled: true,
        soundsEnabled: false,
        wedgeChartOnboardingSeen: false,
        distancesOnboardingSeen: false,
        playOnboardingSeen: false,
        homeOnboardingSeen: false,
        practiceOnboardingSeen: false,
    }),
}));

describe('Random number generator - speech recognition unavailable', () => {
    it('renders without crashing when speech recognition module is missing', () => {
        const { getByText } = render(<Random />);
        expect(getByText('Random number generator')).toBeTruthy();
    });

    it('does not show mic button when speech recognition module is missing', () => {
        const { queryByTestId } = render(<Random />);
        expect(queryByTestId('mic-button')).toBeNull();
    });
});
