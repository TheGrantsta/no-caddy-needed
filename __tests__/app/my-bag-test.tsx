import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import MyBag from '../../app/(tabs)/my-bag';

jest.mock('../../app/play/distances', () => {
    const { Text: MockText } = require('react-native');
    return { __esModule: true, default: () => <MockText testID="distances-screen">Distances screen</MockText> };
});

jest.mock('../../app/play/wedge-chart', () => {
    const { Text: MockText } = require('react-native');
    return { __esModule: true, default: () => <MockText testID="wedge-chart-screen">Wedge chart screen</MockText> };
});

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
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

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

describe('My Bag screen', () => {
    it('shouldShowMyBagTitle', () => {
        const { getByText } = render(<MyBag />);

        expect(getByText('My Bag')).toBeTruthy();
    });

    it('shouldShowDistancesByDefault', () => {
        const { getByTestId, queryByTestId } = render(<MyBag />);

        expect(getByTestId('distances-screen')).toBeTruthy();
        expect(queryByTestId('wedge-chart-screen')).toBeNull();
    });

    it('shouldOfferDistancesAndWedgeChartInTheSubMenu', () => {
        const { getByTestId } = render(<MyBag />);

        expect(getByTestId('bag-sub-menu-distances')).toBeTruthy();
        expect(getByTestId('bag-sub-menu-wedge-chart')).toBeTruthy();
    });

    it('shouldShowWedgeChartWhenWedgeChartSubMenuPressed', () => {
        const { getByTestId, queryByTestId } = render(<MyBag />);

        fireEvent.press(getByTestId('bag-sub-menu-wedge-chart'));

        expect(getByTestId('wedge-chart-screen')).toBeTruthy();
        expect(queryByTestId('distances-screen')).toBeNull();
    });

    it('shouldShowDistancesAgainWhenDistancesSubMenuPressed', () => {
        const { getByTestId, queryByTestId } = render(<MyBag />);

        fireEvent.press(getByTestId('bag-sub-menu-wedge-chart'));
        fireEvent.press(getByTestId('bag-sub-menu-distances'));

        expect(getByTestId('distances-screen')).toBeTruthy();
        expect(queryByTestId('wedge-chart-screen')).toBeNull();
    });

    it('shouldNotRenderAnyPlayScoreContent', () => {
        const { queryByText } = render(<MyBag />);

        expect(queryByText('Course name')).toBeNull();
        expect(queryByText(/Start round/)).toBeNull();
    });

});
