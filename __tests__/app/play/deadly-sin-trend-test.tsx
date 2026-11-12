import React from 'react';
import { render, within } from '@testing-library/react-native';
import DeadlySinTrendScreen from '../../../app/play/deadly-sin-trend';
import { getAllDeadlySinsRoundsService, getAllHoleSinDetailsService, getAllRoundHistoryService, DeadlySinsRound, _HoleSinDetails } from '../../../service/DbService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../service/DbService', () => ({
    getAllDeadlySinsRoundsService: jest.fn(),
    getAllHoleSinDetailsService: jest.fn(),
    getAllRoundHistoryService: jest.fn(),
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
const mockGetAllHoleSinDetailsService = getAllHoleSinDetailsService as jest.Mock;
const mockGetAllRoundHistoryService = getAllRoundHistoryService as jest.Mock;
const DEFAULT_PARAMS = { sinKey: 'ThreePutts', label: '3-putts' };

// The screen is now a horizontal pager of all 7 sins; every page renders the same
// chart testIDs. Scope the per-page assertions to the active sin's page so they stay
// unambiguous. Defaults to the ThreePutts page (the default useLocalSearchParams mock).
const renderPage = (pageKey = 'ThreePutts') => {
    const utils = render(<DeadlySinTrendScreen />);
    return within(utils.getByTestId(`deadly-sin-trend-page-${pageKey}`));
};

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
        mockGetAllHoleSinDetailsService.mockReturnValue([]);
        mockGetAllRoundHistoryService.mockReturnValue([]);
        mockUseLocalSearchParams.mockReturnValue(DEFAULT_PARAMS);
    });

    describe('year filter', () => {
        const yearHistory = [
            { Id: 3, Year: 2026 },
            { Id: 2, Year: 2025 },
            { Id: 1, Year: 2025 },
        ];

        it('shouldShowOnlyRoundsFromTheSelectedYear', () => {
            mockUseLocalSearchParams.mockReturnValue({ ...DEFAULT_PARAMS, filter: '2025' });
            mockGetAllRoundHistoryService.mockReturnValue(yearHistory);
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { getAllByTestId } = renderPage();

            expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(2);
        });

        it('shouldShowEmptyStateWhenTheSelectedYearHasNoRounds', () => {
            mockUseLocalSearchParams.mockReturnValue({ ...DEFAULT_PARAMS, filter: '2019' });
            mockGetAllRoundHistoryService.mockReturnValue(yearHistory);
            mockGetAllDeadlySinsRoundsService.mockReturnValue([makeRound(1, 1, '01/06')]);

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-empty')).toBeTruthy();
        });
    });

    it('renders the sin label as heading', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([]);

        const { getByTestId } = renderPage();

        expect(getByTestId('deadly-sin-trend-heading').props.children).toBe('3-putts');
    });

    it('renders empty state when no rounds', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([]);

        const { getByTestId } = renderPage();

        expect(getByTestId('deadly-sin-trend-empty')).toBeTruthy();
    });

    it('renders chart container when rounds exist', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { getByTestId } = renderPage();

        expect(getByTestId('deadly-sin-trend-chart')).toBeTruthy();
    });

    it('renders one bar per data point', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(3, 3, '03/06'),
            makeRound(2, 2, '02/06'),
            makeRound(1, 1, '01/06'),
        ]);

        const { getAllByTestId } = renderPage();

        expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(3);
    });

    it('renders a short grey stub for a clean round instead of a bar', () => {
        // Screen reverses to chronological order, so the older zero round is index 0.
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(2, 2, '02/06'),
            makeRound(1, 0, '01/06'),
        ]);

        const { getByTestId, queryByTestId } = renderPage();

        expect(getByTestId('deadly-sin-trend-stub-0')).toBeTruthy();
        expect(queryByTestId('deadly-sin-trend-bar-0')).toBeNull();
        expect(getByTestId('deadly-sin-trend-bar-1')).toBeTruthy();
    });

    it('caps data at 20 most recent rounds', () => {
        const manyRounds = Array.from({ length: 25 }, (_, i) =>
            makeRound(25 - i, i + 1, `${String(25 - i).padStart(2, '0')}/06`)
        );
        mockGetAllDeadlySinsRoundsService.mockReturnValue(manyRounds);

        const { getAllByTestId } = renderPage();

        expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(20);
    });

    it('renders x-axis date labels', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(2, 2, '02/06'),
            makeRound(1, 1, '01/06'),
        ]);

        const { getAllByTestId } = renderPage();

        expect(getAllByTestId(/deadly-sin-trend-date-/)).toHaveLength(2);
    });

    it('renders a single bar when only 1 round', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { getAllByTestId } = renderPage();

        expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(1);
    });

    it('renders x-axis line', () => {
        mockGetAllDeadlySinsRoundsService.mockReturnValue([
            makeRound(1, 2, '01/06'),
        ]);

        const { getByTestId } = renderPage();

        expect(getByTestId('deadly-sin-trend-x-axis')).toBeTruthy();
    });

    describe('value labels', () => {
        it('renders the zero and maximum values on the right, and nothing in between', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 1, '02/06'),
                makeRound(1, 0, '01/06'),
            ]);

            const { getByTestId, queryByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-y-label-0').props.children).toBe(0);
            expect(getByTestId('deadly-sin-trend-y-label-3').props.children).toBe(3);
            expect(queryByTestId('deadly-sin-trend-y-label-1')).toBeNull();
            expect(queryByTestId('deadly-sin-trend-y-label-2')).toBeNull();
        });
    });

    describe('maximum line', () => {
        it('renders one dashed line at the maximum value only', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(2, 2, '02/06'),
                makeRound(1, 0, '01/06'),
            ]);

            const { getAllByTestId, getByTestId } = renderPage();

            expect(getAllByTestId(/deadly-sin-trend-max-line/)).toHaveLength(1);
            expect(getByTestId('deadly-sin-trend-max-line').props.style).toEqual(
                expect.arrayContaining([expect.objectContaining({ borderStyle: 'dashed' })])
            );
        });
    });

    describe('trend line', () => {
        it('does not render a trend line', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { queryAllByTestId } = renderPage();

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

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-narrative')).toBeTruthy();
        });

        it('says trouble is trending down when recent rounds improve', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([3, 3, 1, 0]));

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('trending down');
        });

        it('says trouble is creeping up when recent rounds worsen', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([0, 0, 2, 3]));

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('creeping up');
        });

        it('says trouble is holding steady when flat', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([1, 1, 1, 1]));

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('holding steady');
        });

        it('celebrates a clean streak when there are no incidents', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([0, 0, 0]));

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('keep it up');
        });

        it('reports the count of clean rounds', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([0, 3, 0, 1]));

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('clean in 2 of 4');
        });

        it('summarises a single round', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue(newestFirst([2]));

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-narrative').props.children).toContain('most recent round');
        });
    });

    describe('x-axis date label thinning', () => {
        it('thins date labels when there are many rounds', () => {
            const rounds = Array.from({ length: 20 }, (_, i) =>
                makeRound(20 - i, i % 3, `${String(20 - i).padStart(2, '0')}/06`)
            );
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = renderPage();

            const labels = getAllByTestId(/deadly-sin-trend-date-/);
            expect(labels.length).toBeLessThan(20);
            expect(labels.length).toBeGreaterThanOrEqual(2);
        });

        it('never overlaps date labels at 20 points', () => {
            const rounds = Array.from({ length: 20 }, (_, i) =>
                makeRound(20 - i, i % 3, `D${i}`)
            );
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = renderPage();

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

            const { getByTestId } = renderPage();

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

            const { getAllByTestId } = renderPage();

            expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(1);
        });

        it('respects filter=10 to show only 10 most recent rounds', () => {
            mockUseLocalSearchParams.mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts', filter: '10' });
            const rounds = Array.from({ length: 15 }, (_, i) => makeRound(15 - i, i + 1, `${String(15 - i).padStart(2, '0')}/06`));
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = renderPage();

            expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(10);
        });

        it('shows up to MAX_ROUNDS when filter is all', () => {
            mockUseLocalSearchParams.mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts', filter: 'all' });
            const rounds = Array.from({ length: 25 }, (_, i) => makeRound(25 - i, i + 1, `${String(25 - i).padStart(2, '0')}/06`));
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = renderPage();

            expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(20);
        });

        it('shows up to MAX_ROUNDS when no filter param provided', () => {
            const rounds = Array.from({ length: 25 }, (_, i) => makeRound(25 - i, i + 1, `${String(25 - i).padStart(2, '0')}/06`));
            mockGetAllDeadlySinsRoundsService.mockReturnValue(rounds);

            const { getAllByTestId } = renderPage();

            expect(getAllByTestId(/deadly-sin-trend-(bar|stub)-\d+$/)).toHaveLength(20);
        });
    });

    describe('swipe pager', () => {
        it('renders one page per sin', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([makeRound(1, 2, '01/06')]);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            expect(getAllByTestId(/deadly-sin-trend-page-/)).toHaveLength(7);
        });

        it('renders one indicator dot per sin', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([makeRound(1, 2, '01/06')]);

            const { getAllByTestId } = render(<DeadlySinTrendScreen />);

            expect(getAllByTestId(/deadly-sin-trend-indicator-/)).toHaveLength(7);
        });

        it('starts on the page for the sinKey param', () => {
            // Penalties highest, ThreePutts second → ThreePutts is at sorted index 1.
            mockUseLocalSearchParams.mockReturnValue({ sinKey: 'ThreePutts', label: '3-putts' });
            const round: DeadlySinsRound = {
                Id: 1, ThreePutts: 2, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0,
                DoubleChips: 0, TroubleOffTee: 0, Penalties: 5, Total: 7, RoundId: 1, Created_At: '01/06',
            };
            mockGetAllDeadlySinsRoundsService.mockReturnValue([round]);

            const { getByTestId } = render(<DeadlySinTrendScreen />);

            expect(getByTestId('deadly-sin-trend-pager').props.initialScrollIndex).toBe(1);
        });

        it('orders pages by sin frequency (matching the bar chart)', () => {
            const round: DeadlySinsRound = {
                Id: 1, ThreePutts: 2, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0,
                DoubleChips: 0, TroubleOffTee: 0, Penalties: 5, Total: 7, RoundId: 1, Created_At: '01/06',
            };
            mockGetAllDeadlySinsRoundsService.mockReturnValue([round]);

            const { getByTestId } = render(<DeadlySinTrendScreen />);
            const orderedKeys = getByTestId('deadly-sin-trend-pager').props.data.map((c: { key: string }) => c.key);

            expect(orderedKeys[0]).toBe('Penalties');
            expect(orderedKeys[1]).toBe('ThreePutts');
        });
    });

    describe('page layout', () => {
        it('shows the average per round to one decimal with a Last N rounds caption', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-average')).toHaveTextContent('2.0');
            expect(getByTestId('deadly-sin-trend-average-caption')).toHaveTextContent('Last 3 rounds');
        });

        it('shows a status pill describing the trend', () => {
            // Chronological values 1, 2, 3: the later rounds are worse, so it is creeping up
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-status')).toHaveTextContent('Creeping up');
        });

        it('puts the status pill on the caption row, not beside the large average', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { getByTestId } = renderPage();

            expect(within(getByTestId('deadly-sin-trend-average-row')).queryByTestId('deadly-sin-trend-status')).toBeNull();
            expect(within(getByTestId('deadly-sin-trend-caption-row')).getByTestId('deadly-sin-trend-status')).toBeTruthy();
        });

        it('hides the status pill when only one round is recorded', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([makeRound(1, 2, '01/06')]);

            const { queryByTestId } = renderPage();

            expect(queryByTestId('deadly-sin-trend-status')).toBeNull();
        });

        it('gives the bars and the halo square bottom corners sitting on the baseline', () => {
            const { StyleSheet } = require('react-native');
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { getByTestId } = renderPage();
            const bar = StyleSheet.flatten(getByTestId('deadly-sin-trend-bar-1').props.style);
            const halo = StyleSheet.flatten(getByTestId('deadly-sin-trend-halo').props.style);

            [bar, halo].forEach(style => {
                expect(style.borderBottomLeftRadius ?? 0).toBe(0);
                expect(style.borderBottomRightRadius ?? 0).toBe(0);
            });
        });

        it('draws the latest-round halo in a solid colour with whole-pixel edges so it does not look fuzzy', () => {
            const { StyleSheet } = require('react-native');
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { getByTestId } = renderPage();
            const halo = StyleSheet.flatten(getByTestId('deadly-sin-trend-halo').props.style);
            const bar = StyleSheet.flatten(getByTestId('deadly-sin-trend-bar-1').props.style);

            expect(halo.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
            [halo.left, halo.top, halo.width, halo.height, bar.left, bar.top, bar.width, bar.height].forEach(v => {
                expect(Number.isInteger(v)).toBe(true);
            });
        });

        it('does not show a title or caption above the chart', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 3, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);

            const { queryByTestId } = renderPage();

            expect(queryByTestId('deadly-sin-trend-caption')).toBeNull();
        });

        it('shows how many rounds were clean, with a fill in proportion', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([
                makeRound(3, 0, '03/06'),
                makeRound(2, 2, '02/06'),
                makeRound(1, 1, '01/06'),
            ]);
            const { StyleSheet } = require('react-native');

            const { getByTestId } = renderPage();

            expect(getByTestId('deadly-sin-trend-clean-count')).toHaveTextContent('1 of 3');
            expect(StyleSheet.flatten(getByTestId('deadly-sin-trend-clean-fill').props.style).width).toMatch(/^33\.3/);
        });

        it('shows the average at the header size rather than the display size', () => {
            const fontSizes = require('../../../assets/font-sizes').default;
            const { StyleSheet } = require('react-native');
            mockGetAllDeadlySinsRoundsService.mockReturnValue([makeRound(1, 2, '01/06')]);

            const { getByTestId } = renderPage();

            expect(StyleSheet.flatten(getByTestId('deadly-sin-trend-average').props.style).fontSize).toBe(fontSizes.header);
        });

        it('shows a back button to the left of the title in the title row', () => {
            mockGetAllDeadlySinsRoundsService.mockReturnValue([makeRound(1, 2, '01/06')]);

            const { getByTestId } = renderPage();
            const row = within(getByTestId('deadly-sin-trend-title-row'));

            expect(row.getByTestId('deadly-sin-trend-back-button')).toBeTruthy();
            expect(row.getByTestId('deadly-sin-trend-heading')).toBeTruthy();
        });
    });
});
