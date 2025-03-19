import React from 'react';
import { render } from '@testing-library/react-native';
import View from '../../app/(tabs)/settings';

jest.mock('../../service/DbService', () => ({
    getWedgeChartService: jest.fn(() => [[]])
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

describe('Settings page ', () => {
    it('renders page title', () => {
        const { getByText } = render(<View />);

        expect(getByText('Settings')).toBeTruthy();
    });

    it('renders heading', () => {
        const { getByText } = render(<View />)

        expect(getByText('Wedge chart')).toBeTruthy();
    });
});
