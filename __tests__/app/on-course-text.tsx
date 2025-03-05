import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
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
        expect(getByText('Aim: play for your shot shape *')).toBeTruthy();
        expect(getByText('Yardage: closer to the back edge')).toBeTruthy();
    });

    it('renders approach tendencies', () => {
        const { getByText } = render(<View />);

        expect(getByText('* Your shot shape might be different with different clubs; for example, do you draw your wedges and fade your mid-irons?')).toBeTruthy();
        expect(getByText('Know your tendencies including when hitting full & partial shots')).toBeTruthy();
    });

    it('renders correctly with wedge chart heading', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-wedge-chart');

        fireEvent.press(subMenuItem);

        expect(getByText('Use your wedge chart to hit more greens')).toBeTruthy();
        expect(getByText('Benefits')).toBeTruthy();
    });

    it('renders correctly with wedge chart heading', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-wedge-chart');

        fireEvent.press(subMenuItem);

        expect(getByText('Use your wedge chart to hit more greens')).toBeTruthy();
        expect(getByText('Benefits')).toBeTruthy();
    });

    it('renders correctly with stats heading', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Manage your expectations, better!')).toBeTruthy();
    });

    it('renders correctly with stats buttons for approach shots and putting', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-stats');

        fireEvent.press(subMenuItem);

        const button = getByTestId('stats-approach-shots-button');

        fireEvent.press(button);

        expect(getByText('Approach shots')).toBeTruthy();
        expect(getByText('Putting')).toBeTruthy();
    });


    it('renders correctly with stats approach shot proximity', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Approach shots')).toBeTruthy();
        expect(getByText('Average proximity to the hole')).toBeTruthy();
        expect(getByText('Distance')).toBeTruthy();
        expect(getByText('Fairway')).toBeTruthy();
        expect(getByText('Rough')).toBeTruthy();
    });
});
