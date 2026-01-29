import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import View from '../../app/(tabs)/on-course';
import { getWedgeChartService, insertTiger5RoundService, getAllTiger5RoundsService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getWedgeChartService: jest.fn(() => [[]]),
    insertTiger5RoundService: jest.fn(() => Promise.resolve(true)),
    getAllTiger5RoundsService: jest.fn(() => []),
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

describe('Course page ', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getWedgeChartService as jest.Mock).mockReturnValue([]);
        (getAllTiger5RoundsService as jest.Mock).mockReturnValue([]);
    });

    describe('Approach section', () => {
        it('renders correctly with the default text', () => {
            const { getByTestId, getByText } = render(<View />);

            fireEvent.press(getByTestId('on-course-sub-menu-approach'));

            expect(getByText('On course')).toBeTruthy();
            expect(getByText('Make better on course decisions & choose better targets')).toBeTruthy();
        });

        it('renders approach heading and sub heading', () => {
            const { getByTestId, getByText } = render(<View />);

            fireEvent.press(getByTestId('on-course-sub-menu-approach'));

            expect(getByText('Approach shots')).toBeTruthy();
            expect(getByText('Target: centre of the green')).toBeTruthy();
            expect(getByText('Aim: play for your shot shape *')).toBeTruthy();
            expect(getByText('Yardage: closer to the back edge')).toBeTruthy();
        });

        it('renders approach tendencies', () => {
            const { getByTestId, getByText } = render(<View />);

            fireEvent.press(getByTestId('on-course-sub-menu-approach'));

            expect(getByText('* Your shot shape might be different with different clubs; for example, draw your wedges & fade your mid-irons')).toBeTruthy();
            expect(getByText('Know your tendencies including when hitting full & partial shots')).toBeTruthy();
        });
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

        const subMenuItem = getByTestId('on-course-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Manage your expectations, better!')).toBeTruthy();
    });

    it('renders correctly with stats approach shots headings', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Approach shots')).toBeTruthy();
        expect(getByText('Average proximity to the hole')).toBeTruthy();
    });

    it('renders correctly with stats approach shot proximity', () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        expect(getByText('Distance')).toBeTruthy();
        expect(getByText('Fairway')).toBeTruthy();
        expect(getByText('Rough')).toBeTruthy();
    });

    it('renders correctly with stats putting make rates', async () => {
        const { getByTestId, getByText } = render(<View />);

        const subMenuItem = getByTestId('on-course-sub-menu-pro-stats');

        fireEvent.press(subMenuItem);

        const flatList = getByTestId('on-course-flat-list');

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

    describe('Tiger 5 section', () => {
        it('renders Tiger 5 tally as default section', () => {
            const { getByTestId, getByText, getAllByText } = render(<View />);

            expect(getAllByText('Tiger 5').length).toBeGreaterThanOrEqual(1);
            expect(getByText('Track avoidable mistakes during your round')).toBeTruthy();
            expect(getByTestId('tiger5-total')).toBeTruthy();
            expect(getByTestId('tiger5-save-round')).toBeTruthy();
        });

        it('shows tally counters', () => {
            const { getByText } = render(<View />);

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByText('Bogeys on par 5s')).toBeTruthy();
            expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
            expect(getByText('Double chips')).toBeTruthy();
        });

        it('calls insertTiger5RoundService on save', async () => {
            const { getByTestId } = render(<View />);

            fireEvent.press(getByTestId('tiger5-increment-three-putts'));
            fireEvent.press(getByTestId('tiger5-save-round'));

            await waitFor(() => {
                expect(insertTiger5RoundService).toHaveBeenCalledWith(1, 0, 0, 0, 0);
            });
        });

        it('shows "No round history yet" when no rounds exist', () => {
            (getAllTiger5RoundsService as jest.Mock).mockReturnValue([]);

            const { getByText } = render(<View />);

            expect(getByText('No round history yet')).toBeTruthy();
        });

        it('displays round dates and totals when data exists', () => {
            (getAllTiger5RoundsService as jest.Mock).mockReturnValue([
                { Id: 1, ThreePutts: 1, DoubleBogeys: 2, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 0, Total: 4, Created_At: '15/06' },
            ]);

            const { getByText } = render(<View />);

            expect(getByText('Round history')).toBeTruthy();
            expect(getByText('15/06')).toBeTruthy();
            expect(getByText('4')).toBeTruthy();
        });

        it('shows multiple rounds', () => {
            (getAllTiger5RoundsService as jest.Mock).mockReturnValue([
                { Id: 2, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, Total: 0, Created_At: '20/02' },
                { Id: 1, ThreePutts: 1, DoubleBogeys: 1, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 1, Total: 5, Created_At: '19/02' },
            ]);

            const { getByText } = render(<View />);

            expect(getByText('20/02')).toBeTruthy();
            expect(getByText('19/02')).toBeTruthy();
            expect(getByText('5')).toBeTruthy();
        });
    });
});
