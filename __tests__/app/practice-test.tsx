import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import View from '../../app/(tabs)/practice';

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest
            .fn()
            .mockImplementation(({ children }) => children),
    };
});

describe('Practice page ', () => {
    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('Practice')).toBeTruthy();
        expect(getByText('Make your practice time more effective')).toBeTruthy();
        expect(getByText('Short game practice')).toBeTruthy();
    });
});
