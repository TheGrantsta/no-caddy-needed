import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import View from '../../app/(tabs)/paradigms';

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
            expect(getByText('Target: centre of the green')).toBeTruthy();
            expect(getByText('Aim: play for your shot shape *')).toBeTruthy();
            expect(getByText('Yardage: closer to the back edge')).toBeTruthy();
        });

        it('renders approach tendencies', () => {
            const { getByText } = render(<View />);

            expect(getByText('* Your shot shape might be different with different clubs; for example, draw your wedges & fade your mid-irons')).toBeTruthy();
            expect(getByText('Know your tendencies including when hitting full & partial shots')).toBeTruthy();
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
