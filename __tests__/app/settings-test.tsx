import React from 'react';
import { render } from '@testing-library/react-native';
import View from '../../app/settings';

jest.mock('../../service/DbService', () => ({
    getWedgeChartService: jest.fn(() => [[]]),
    getClubDistancesService: jest.fn(() => []),
    saveClubDistancesService: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
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

    it('renders club distances heading', () => {
        const { getByText } = render(<View />)

        expect(getByText('Club distances')).toBeTruthy();
    });
});
