import React from 'react';
import { render } from '@testing-library/react-native';
import WedgeChartScreen from '../../../app/play/wedge-chart';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/stlyes').default,
}));

jest.mock('../../../service/DbService', () => ({
    getWedgeChartService: jest.fn(() => ({ distanceNames: [], clubs: [] })),
    saveWedgeChartService: jest.fn(),
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

describe('Wedge Chart screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders wedge chart heading', () => {
        const { getByText } = render(<WedgeChartScreen />);

        expect(getByText('Wedge chart')).toBeTruthy();
    });

    it('renders wedge distances subtitle', () => {
        const { getByText } = render(<WedgeChartScreen />);

        expect(getByText('Your wedge carry distances')).toBeTruthy();
    });

    it('shows save button', () => {
        const { getByTestId } = render(<WedgeChartScreen />);

        expect(getByTestId('save-wedge-chart-button')).toBeTruthy();
    });

    it('shows add club button', () => {
        const { getByTestId } = render(<WedgeChartScreen />);

        expect(getByTestId('add-wedge-club-button')).toBeTruthy();
    });

    it('shows add distance button', () => {
        const { getByTestId } = render(<WedgeChartScreen />);

        expect(getByTestId('add-wedge-distance-button')).toBeTruthy();
    });
});
