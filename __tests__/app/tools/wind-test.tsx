import React from 'react';
import { render } from '@testing-library/react-native';
import Wind from '../../../app/tools/wind';

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
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

const mockRefreshWind = jest.fn();
let mockWindValue: { directionFrom: number; speedMph: number } | null = { directionFrom: 100, speedMph: 12 };
jest.mock('../../../hooks/useWind', () => ({
    useWind: () => ({ wind: mockWindValue, heading: 0, refreshWind: mockRefreshWind }),
}));

describe('Wind tool screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWindValue = { directionFrom: 100, speedMph: 12 };
    });

    it('renders the screen header', () => {
        const { getByText } = render(<Wind />);
        expect(getByText('Wind')).toBeTruthy();
    });

    it('shows the wind display when wind data is available', () => {
        const { getByTestId, queryByTestId } = render(<Wind />);
        expect(getByTestId('wind-arrow-large')).toBeTruthy();
        expect(queryByTestId('wind-tool-unavailable')).toBeNull();
    });

    it('shows an unavailable message when there is no wind data', () => {
        mockWindValue = null;
        const { getByTestId, queryByTestId } = render(<Wind />);
        expect(getByTestId('wind-tool-unavailable')).toBeTruthy();
        expect(queryByTestId('wind-arrow-large')).toBeNull();
    });

    it('refreshes wind on mount', () => {
        render(<Wind />);
        expect(mockRefreshWind).toHaveBeenCalled();
    });

    it('renders the display in compact mode (no duplicated title or aim hint)', () => {
        const { queryByTestId } = render(<Wind />);
        expect(queryByTestId('wind-display-title')).toBeNull();
        expect(queryByTestId('wind-aim-hint')).toBeNull();
    });
});
