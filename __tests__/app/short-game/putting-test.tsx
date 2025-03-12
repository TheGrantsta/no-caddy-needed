import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../../app/short-game/putting';

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

describe('Putting page ', () => {
    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Putting drills')).toBeTruthy();
    });

    it('renders correctly with the games heading', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('putting-sub-menu-putting-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Putting games')).toBeTruthy();
    });

    it('renders correctly with the games', () => {
        const { getByText, getByTestId } = render(<View />);

        const subMenuItem = getByTestId('putting-sub-menu-putting-games');

        fireEvent.press(subMenuItem);

        expect(getByText('Around the world!')).toBeTruthy();
        expect(getByText('Ladder challenge!')).toBeTruthy();
    });
});
