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

    it('shows heading and points', () => {
        const points = ['Control low point', 'Improve centre strike', 'Enhance clubface control'];
        const { getByText } = render(<Homepage />);

        expect(getByText('Get the ball in the hole in the fewest shots')).toBeTruthy();
        expect(getByText('Control low point')).toBeTruthy();
        expect(getByText('Improve centre strike')).toBeTruthy();
        expect(getByText('Enhance clubface control')).toBeTruthy();
    });
});

