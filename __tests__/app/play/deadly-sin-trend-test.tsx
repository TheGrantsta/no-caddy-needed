import React from 'react';
import { render } from '@testing-library/react-native';
import DeadlySinTrendScreen from '../../../app/play/deadly-sin-trend';
import { getAllDeadlySinsRoundsService, DeadlySinsRound } from '../../../service/DbService';

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

jest.mock('../../../service/DbService', () => ({
    getAllDeadlySinsRoundsService: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

const mockUseLocalSearchParams = jest.fn().mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts' });
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const mockGetAllDeadlySinsRoundsService = getAllDeadlySinsRoundsService as jest.Mock;

function makeRound(id: number, threePutts: number, date: string): DeadlySinsRound {
    return {
        Id: id,
        ThreePutts: threePutts,
        DoubleBogeys: 0,
        BogeysPar5: 0,
        BogeysInside9Iron: 0,
        DoubleChips: 0,
        TroubleOffTee: 0,
        Penalties: 0,
        Total: threePutts,
        RoundId: id,
        Created_At: date,
    };
}

describe('DeadlySinTrendScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the sin label as heading', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([]);

        const { getByTestId } = render(<DeadlySinTrendScreen />);

        expect(getByTestId('deadly-sin-trend-heading').props.children).toBe('3-putts');
    });

    it('renders empty state when no rounds', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([]);

        const { getByTestId } = render(<DeadlySinTrendScreen />);

        expect(getByTestId('deadly-sin-trend-empty')).toBeTruthy();
    });

    it('renders chart container when rounds exist', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { getByTestId } = render(<DeadlySinTrendScreen />);

        expect(getByTestId('deadly-sin-trend-chart')).toBeTruthy();
    });

    it('renders one dot per data point', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(3, 3, '03/06'),
            makeRound(2, 2, '02/06'),
            makeRound(1, 1, '01/06'),
        ]);

        const { getAllByTestId } = render(<DeadlySinTrendScreen />);

        expect(getAllByTestId(/deadly-sin-trend-dot-/)).toHaveLength(3);
    });

    it('renders one stem per data point', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(3, 3, '03/06'),
            makeRound(2, 2, '02/06'),
            makeRound(1, 1, '01/06'),
        ]);

        const { getAllByTestId } = render(<DeadlySinTrendScreen />);

        expect(getAllByTestId(/deadly-sin-trend-stem-/)).toHaveLength(3);
    });

    it('renders a zero-height stem for a clean round', () => {
        // Screen reverses to chronological order, so the older zero round is index 0.
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(2, 2, '02/06'),
            makeRound(1, 0, '01/06'),
        ]);

        const { getByTestId } = render(<DeadlySinTrendScreen />);

        expect(getByTestId('deadly-sin-trend-stem-0').props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({ height: 0 })])
        );
    });

    it('caps data at 20 most recent rounds', () => {
        const manyRounds = Array.from({ length: 25 }, (_, i) =>
            makeRound(25 - i, i + 1, `${String(25 - i).padStart(2, '0')}/06`)
        );
        mockGetAllDeadlySinsRoundsService.mockReturnValue(manyRounds);

        const { getAllByTestId } = render(<DeadlySinTrendScreen />);

        expect(getAllByTestId(/deadly-sin-trend-dot-/)).toHaveLength(20);
    });

    it('renders x-axis date labels', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(2, 2, '02/06'),
            makeRound(1, 1, '01/06'),
        ]);

        const { getAllByTestId } = render(<DeadlySinTrendScreen />);

        expect(getAllByTestId(/deadly-sin-trend-date-/)).toHaveLength(2);
    });

    it('renders a single dot when only 1 round', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { getAllByTestId } = render(<DeadlySinTrendScreen />);

        expect(getAllByTestId(/deadly-sin-trend-dot-/)).toHaveLength(1);
    });

    it('renders y-axis line', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { getByTestId } = render(<DeadlySinTrendScreen />);

        expect(getByTestId('deadly-sin-trend-y-axis')).toBeTruthy();
    });

    it('renders x-axis line', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { getByTestId } = render(<DeadlySinTrendScreen />);

        expect(getByTestId('deadly-sin-trend-x-axis')).toBeTruthy();
    });

    describe('y-axis value labels', () => {
        it('renders an integer tick label for zero and the max value', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 1, '02/06'),
                makeRound(1, 0, '01/06'),
            ]);

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-y-label-0').props.children).toBe(0);
            expect(getByTestId('deadly-sin-trend-y-label-3').props.children).toBe(3);
        });

        it('renders one y-label per integer up to the max value', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(2, 2, '02/06'),
                makeRound(1, 0, '01/06'),
            ]);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            // values 0, 1, 2
            expect(getAllByTestId(/deadly-sin-trend-y-label-/)).toHaveLength(3);
        });
    });

    describe('gridlines', () => {
        it('renders a horizontal gridline per integer tick', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(2, 2, '02/06'),
                makeRound(1, 0, '01/06'),
            ]);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            // ticks at 0, 1, 2
            expect(getAllByTestId(/deadly-sin-trend-gridline-/)).toHaveLength(3);
        });
    });

    describe('trend line', () => {
        it('does not render a trend line', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { queryAllByTestId } = render(<DeadlySinTrendScreen />);

            expect(queryAllByTestId(/deadly-sin-trend-trend-/)).toHaveLength(0);
        });
    });

    describe('narrative summary', () => {
        // Service returns newest-first; the screen reverses to chronological order,
        // so build the mock from a chronological series reversed.
        function newestFirst(chronological: number[]) {
            return chronological
                .map((v, i) => makeRound(i + 1, v, `D${i}`))
                .reverse();
        }

        it('renders a narrative summary when rounds exist', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([1, 2, 1]));

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-narrative')).toBeTruthy();
        });

        it('says trouble is trending down when recent rounds improve', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([3, 3, 1, 0]));

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('trending down');
        });

        it('says trouble is creeping up when recent rounds worsen', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([0, 0, 2, 3]));

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('creeping up');
        });

        it('says trouble is holding steady when flat', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([1, 1, 1, 1]));

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('holding steady');
        });

        it('celebrates a clean streak when there are no incidents', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([0, 0, 0]));

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('keep it up');
        });

        it('reports the count of clean rounds', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([0, 3, 0, 1]));

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('clean in 2 of 4');
        });

        it('summarises a single round', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([2]));

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('most recent round');
        });
    });

    describe('x-axis date label thinning', () => {
        it('thins date labels when there are many rounds', () => {
            const rounds = Array.from({ length: 20 }, (_, i) =>
                makeRound(20 - i, i % 3, `${String(20 - i).padStart(2, '0')}/06`)
            );
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            const labels = getAllByTestId(/deadly-sin-trend-date-/);
            expect(labels.length).toBeLessThan(20);
            expect(labels.length).toBeGreaterThanOrEqual(2);
        });

        it('never overlaps date labels at 20 points', () => {
            const rounds = Array.from({ length: 20 }, (_, i) =>
                makeRound(20 - i, i % 3, `D${i}`)
            );
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            const spans = getAllByTestId(/deadly-sin-trend-date-/)
                .map((node) => {
                    const flat = Object.assign({}, ...node.props.style);
                    return { left: flat.left, right: flat.left + flat.width };
                })
                .sort((a, b) => a.left - b.left);

            for (let i = 1; i < spans.length; i++) {
                expect(spans[i].left).toBeGreaterThanOrEqual(spans[i - 1].right);
            }
        });

        it('always shows the first and most recent date labels', () => {
            const rounds = Array.from({ length: 20 }, (_, i) =>
                makeRound(20 - i, i % 3, `D${i}`)
            );
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            // oldest (index 0) and newest (index 19) must be present
            expect(getByTestId('deadly-sin-trend-date-0')).toBeTruthy();
            expect(getByTestId('deadly-sin-trend-date-19')).toBeTruthy();
        });
    });

    describe('filter param', () => {
        beforeEach(() => {
            mockUseLocalSearchParams.mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts' });
        });

        it('respects filter=1 to show only most recent round', () => {
            mockUseLocalSearchParams.mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts', filter: '1' });
            const rounds = Array.from({ length: 5 }, (_, i) => makeRound(5 - i, i + 1, `${String(5 - i).padStart(2, '0')}/06`));
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            expect(getAllByTestId(/deadly-sin-trend-dot-/)).toHaveLength(1);
        });

        it('respects filter=10 to show only 10 most recent rounds', () => {
            mockUseLocalSearchParams.mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts', filter: '10' });
            const rounds = Array.from({ length: 15 }, (_, i) => makeRound(15 - i, i + 1, `${String(15 - i).padStart(2, '0')}/06`));
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            expect(getAllByTestId(/deadly-sin-trend-dot-/)).toHaveLength(10);
        });

        it('shows up to MAX_ROUNDS when filter is all', () => {
            mockUseLocalSearchParams.mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts', filter: 'all' });
            const rounds = Array.from({ length: 25 }, (_, i) => makeRound(25 - i, i + 1, `${String(25 - i).padStart(2, '0')}/06`));
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            expect(getAllByTestId(/deadly-sin-trend-dot-/)).toHaveLength(20);
        });

        it('shows up to MAX_ROUNDS when no filter param provided', () => {
            const rounds = Array.from({ length: 25 }, (_, i) => makeRound(25 - i, i + 1, `${String(25 - i).padStart(2, '0')}/06`));
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            expect(getAllByTestId(/deadly-sin-trend-dot-/)).toHaveLength(20);
        });
    });
});
