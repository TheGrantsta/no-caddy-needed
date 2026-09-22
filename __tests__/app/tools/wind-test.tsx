import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

jest.mock('expo-router', () => ({
    useFocusEffect: jest.fn((callback) => {
        callback();
    }),
}));

const mockRefreshWind = jest.fn().mockResolvedValue(undefined);
let mockWindValue: { directionFrom: number; speedMph: number } | null = { directionFrom: 100, speedMph: 12 };
let mockLocationIssue: 'servicesDisabled' | 'permissionDenied' | null = null;
jest.mock('../../../hooks/useWind', () => ({
    useWind: () => ({ wind: mockWindValue, heading: 0, refreshWind: mockRefreshWind, locationIssue: mockLocationIssue }),
}));


describe('Wind tool screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWindValue = { directionFrom: 100, speedMph: 12 };
        mockLocationIssue = null;
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

    it('shows location services disabled message when locationIssue is servicesDisabled', () => {
        mockWindValue = null;
        mockLocationIssue = 'servicesDisabled';
        const { getByTestId, queryByTestId, getByText } = render(<Wind />);
        expect(getByTestId('wind-tool-location-off')).toBeTruthy();
        expect(queryByTestId('wind-tool-unavailable')).toBeNull();
        expect(getByText(/location services/i)).toBeTruthy();
    });

    it('shows permission denied message when locationIssue is permissionDenied', () => {
        mockWindValue = null;
        mockLocationIssue = 'permissionDenied';
        const { getByTestId, queryByTestId, getByText } = render(<Wind />);
        expect(getByTestId('wind-tool-permission-denied')).toBeTruthy();
        expect(queryByTestId('wind-tool-unavailable')).toBeNull();
        expect(getByText(/permission/i)).toBeTruthy();
    });

    it('renders Open Settings button when location issue is servicesDisabled', () => {
        mockWindValue = null;
        mockLocationIssue = 'servicesDisabled';
        const { getByTestId } = render(<Wind />);
        const button = getByTestId('wind-open-settings-button');
        expect(button).toBeTruthy();
    });

    it('shows generic unavailable message when locationIssue is null but wind is null', () => {
        mockWindValue = null;
        mockLocationIssue = null;
        const { getByTestId, queryByTestId } = render(<Wind />);
        expect(getByTestId('wind-tool-unavailable')).toBeTruthy();
        expect(queryByTestId('wind-tool-location-off')).toBeNull();
        expect(queryByTestId('wind-tool-permission-denied')).toBeNull();
    });

    it('registers a useFocusEffect callback that does not return a Promise', () => {
        render(<Wind />);
        const mockUseFocusEffect = require('expo-router').useFocusEffect as jest.Mock;
        const registeredCallback = mockUseFocusEffect.mock.calls[0][0];
        const result = registeredCallback();
        expect(result).toBeUndefined();
    });
});
