import * as React from 'react';
import { render } from '@testing-library/react-native';
import Homepage from '../../app/(tabs)/index';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
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

describe('renders homepage', () => {
    it('shows title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('No caddy needed!')).toBeTruthy();
    });

    it('shows sub title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Smarter play, practice & performance')).toBeTruthy();
    });

    it('shows sub, sub title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Be your own best caddy')).toBeTruthy();
    });

    it('shows links on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Play')).toBeTruthy();
        expect(getByText('Practice')).toBeTruthy();
        expect(getByText('Perform')).toBeTruthy();
    });

    it('shows points on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Golf simplified')).toBeTruthy();
        expect(getByText('In a nutshell: hit it, find it and hit it again')).toBeTruthy();
        expect(getByText('Point: get the ball in the hole with the fewest shots')).toBeTruthy();
        expect(getByText('Have fun: golf is a game, so for goodness sake enjoy it!')).toBeTruthy();
    });

    it('shows footer text on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Golf is not a game of perfect, or having a perfect swing')).toBeTruthy();
    });
});

