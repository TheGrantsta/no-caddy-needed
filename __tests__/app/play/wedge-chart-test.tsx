import React from 'react';
import { render } from '@testing-library/react-native';
import WedgeChartScreen from '../../../app/play/wedge-chart';
import { getWedgeChartService } from '../../../service/DbService';

jest.mock('../../../service/DbService', () => ({
    getWedgeChartService: jest.fn(() => [[]]),
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

describe('Wedge Chart screen (Play)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders wedge chart heading', () => {
        const { getAllByText } = render(<WedgeChartScreen />);

        expect(getAllByText('Wedge chart').length).toBeGreaterThanOrEqual(1);
    });

    it('renders wedge distances subtitle', () => {
        const { getByText } = render(<WedgeChartScreen />);

        expect(getByText('Your wedge distances')).toBeTruthy();
    });
});
