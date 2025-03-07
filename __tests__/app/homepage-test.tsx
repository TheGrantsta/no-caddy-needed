import * as React from 'react';
import { render } from '@testing-library/react-native';
import Homepage from '../../app/(tabs)/index';

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

        expect(getByText('Golfers seeking smarter practice & setting better on course expectations')).toBeTruthy();
    });

    it('shows sub, sub title', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Be your own best caddy')).toBeTruthy();
    });

    it('shows links on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Practice')).toBeTruthy();
        expect(getByText('On course')).toBeTruthy();
    });

    it('shows heading and points', () => {
        const points = ['Control low point', 'Improve centre strike', 'Enhance clubface control'];
        const { getByText } = render(<Homepage />);

        expect(getByText('Golf - get the ball in the hole in the fewest shots by:')).toBeTruthy();
        expect(getByText('Controlling low point')).toBeTruthy();
        expect(getByText('Improving centre strike')).toBeTruthy();
        expect(getByText('Enhancing clubface control')).toBeTruthy();
    });

    it('shows footer text on homepage', () => {
        const { getByText } = render(<Homepage />);

        expect(getByText('Golf is not a game of perfect, or having a perfect swing')).toBeTruthy();
    });
});

