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

    it('renders N-1 line segments for N points', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(3, 3, '03/06'),
            makeRound(2, 2, '02/06'),
            makeRound(1, 1, '01/06'),
        ]);

        const { getAllByTestId } = render(<DeadlySinTrendScreen />);

        expect(getAllByTestId(/deadly-sin-trend-line-/)).toHaveLength(2);
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

    it('no line segment when only 1 round', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { queryByTestId } = render(<DeadlySinTrendScreen />);

        expect(queryByTestId('deadly-sin-trend-line-0')).toBeNull();
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
