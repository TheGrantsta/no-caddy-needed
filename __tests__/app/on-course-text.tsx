import React from 'react';
import { render } from '@testing-library/react-native';
import View from '../../app/(tabs)/on-course';
import { getWedgeChartService } from '../../service/DbService';

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

describe('Course page ', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getWedgeChartService as jest.Mock).mockReturnValue([]);
    });

    it('renders correctly with the default text', () => {
        const { getByText } = render(<View />);

        expect(getByText('On course')).toBeTruthy();
        expect(getByText('Make better on course decisions & choose better targets')).toBeTruthy();
    });

    it('renders approach heading and sub heading', () => {
        const { getByText } = render(<View />);

        expect(getByText('Approach shots')).toBeTruthy();
        expect(getByText('Target: centre of the green')).toBeTruthy();
        expect(getByText('Aim: play for your shot shape')).toBeTruthy();
        expect(getByText('Yardage: closer to the back edge')).toBeTruthy();
    });

    it('renders correctly with wedge chart heading', () => {
        const { getByText } = render(<View />);

        expect(getByText('Wedge chart')).toBeTruthy();
    });
});
