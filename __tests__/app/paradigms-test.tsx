import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import View from '../../app/(tabs)/paradigms';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/stlyes').default,
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

describe('Paradigms page ', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Approach section', () => {
        it('renders correctly with the default text', () => {
            const { getByText } = render(<View />);

            expect(getByText('Paradigms')).toBeTruthy();
            expect(getByText('Make better on course decisions & choose better targets')).toBeTruthy();
        });

        it('renders approach as the default section', () => {
            const { getByText } = render(<View />);

            expect(getByText('Approach shots')).toBeTruthy();
            expect(getByText('Target: centre of the green — play for your shot dispersion')).toBeTruthy();
            expect(getByText('Strategy: favour the side with the most room and the safest miss')).toBeTruthy();
            expect(getByText('Avoid: eliminate big numbers by staying away from water and severe hazards')).toBeTruthy();
        });

        it('renders approach tendencies', () => {
            const { getByText } = render(<View />);

            expect(getByText('* Your dispersion changes with different clubs and swing types — know your tendencies for full and partial shots')).toBeTruthy();
            expect(getByText('Know your shot pattern and make decisions that allow for your natural spread, not perfect strikes')).toBeTruthy();
        });
    });

    it('renders correctly with stats heading', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('paradigms-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Manage your expectations, better!')).toBeTruthy();
    });

    it('renders correctly with stats approach shots headings', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('paradigms-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Approach shots')).toBeTruthy();
        expect(getByText('Average proximity to the hole')).toBeTruthy();
    });

    it('renders correctly with stats approach shot proximity', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('paradigms-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Distance')).toBeTruthy();
        expect(getByText('Fairway')).toBeTruthy();
        expect(getByText('Rough')).toBeTruthy();
    });

    it('renders correctly with stats putting make rates', async () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('paradigms-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        const flatList = getByTestId('paradigms-flat-list');

        fireEvent.scroll(flatList, {
            nativeEvent: {
                contentOffset: { x: 500, y: 0 },
                contentSize: { width: 500, height: 100 },
                layoutMeasurement: { width: 300, height: 100 }
            },
        });

        await waitFor(() => {
            expect(getByText('Distance (feet)')).toBeTruthy();
            expect(getByText('Make rate')).toBeTruthy();
            expect(getByText(/Source:/)).toBeTruthy();
        });
    });
});
