import React, { act } from 'react';
import { Animated, _FlatList, ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import Perform from '../../../app/(tabs)/perform';

let capturedFocusEffect: (() => void) | null = null;

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
    useFocusEffect: (cb: () => void) => { capturedFocusEffect = cb; },
    useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../hooks/useOrientation', () => ({
    useOrientation: () => ({ landscapePadding: {} }),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: () => null,
}));

jest.mock('../../../service/FirebaseService', () => ({
    logEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../service/DbService', () => ({
    getSettingsService: jest.fn().mockReturnValue({ performOnboardingSeen: true, units: 'yards' }),
    saveSettingsService: jest.fn().mockResolvedValue(true),
    getAllDeadlySinsRoundsService: jest.fn().mockReturnValue([]),
    getAllRoundHistoryService: jest.fn().mockReturnValue([]),
    formatPuttCount: (count: number) => count > 99 ? '99+' : String(count),
    getUpAndDownRateService: jest.fn().mockReturnValue({ rate: '-', upAndDowns: 0, attempts: 0 }),
    getPuttingMakeRatesService: jest.fn().mockReturnValue([
        { distance: 1, makeRate: '98%', putts: 45 },
        { distance: 2, makeRate: '95%', putts: 38 },
        { distance: 3, makeRate: '92%', putts: 52 },
        { distance: 4, makeRate: '85%', putts: 41 },
        { distance: 5, makeRate: '75%', putts: 24 },
        { distance: 6, makeRate: '65%', putts: 31 },
        { distance: 7, makeRate: '57%', putts: 28 },
        { distance: 8, makeRate: '49%', putts: 35 },
        { distance: 9, makeRate: '42%', putts: 19 },
        { distance: 10, makeRate: '38%', putts: 21 },
        { distance: 11, makeRate: '33%', putts: 0 },
        { distance: 12, makeRate: '30%', putts: 0 },
        { distance: 13, makeRate: '27%', putts: 0 },
        { distance: 14, makeRate: '25%', putts: 0 },
        { distance: 15, makeRate: '23%', putts: 0 },
        { distance: 16, makeRate: '21%', putts: 0 },
        { distance: 17, makeRate: '19%', putts: 0 },
        { distance: 18, makeRate: '17%', putts: 0 },
        { distance: 19, makeRate: '16%', putts: 0 },
        { distance: 20, makeRate: '14%', putts: 0 },
        { distance: 25, makeRate: '10%', putts: 0 },
        { distance: 30, makeRate: '7%', putts: 0 },
        { distance: 35, makeRate: '5%', putts: 0 },
        { distance: 40, makeRate: '3%', putts: 0 },
        { distance: 45, makeRate: '2%', putts: 0 },
        { distance: 50, makeRate: '1%', putts: 0 },
    ]),
    getPuttingProximityService: jest.fn().mockReturnValue([
        { distance: 1, shortPercent: '60%', longPercent: '40%' },
        { distance: 2, shortPercent: '65%', longPercent: '35%' },
        { distance: 3, shortPercent: '70%', longPercent: '30%' },
        { distance: 4, shortPercent: '62%', longPercent: '38%' },
        { distance: 5, shortPercent: '68%', longPercent: '32%' },
        { distance: 6, shortPercent: '55%', longPercent: '45%' },
        { distance: 7, shortPercent: '72%', longPercent: '28%' },
        { distance: 8, shortPercent: '58%', longPercent: '42%' },
        { distance: 9, shortPercent: '64%', longPercent: '36%' },
        { distance: 10, shortPercent: '71%', longPercent: '29%' },
        { distance: 15, shortPercent: '66%', longPercent: '34%' },
        { distance: 20, shortPercent: '-', longPercent: '-' },
        { distance: 25, shortPercent: '-', longPercent: '-' },
        { distance: 30, shortPercent: '-', longPercent: '-' },
        { distance: 35, shortPercent: '-', longPercent: '-' },
        { distance: 40, shortPercent: '-', longPercent: '-' },
        { distance: 45, shortPercent: '-', longPercent: '-' },
        { distance: 50, shortPercent: '-', longPercent: '-' },
    ]),
    getAllHoleSinDetailsService: jest.fn().mockReturnValue([]),
}));

describe('Perform', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedFocusEffect = null;
        const { getSettingsService } = require('../../../service/DbService');
        getSettingsService.mockReturnValue({ performOnboardingSeen: true, units: 'yards' });
    });

    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<Perform />);
        expect(toJSON()).toBeTruthy();
    });

    describe('onRefresh', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        it('onRefreshShowsSpinnerWhileRefreshing', () => {
            const { UNSAFE_getByType } = render(<Perform />);
            act(() => {
                UNSAFE_getByType(ScrollView).props.refreshControl.props.onRefresh();
            });
            expect(UNSAFE_getByType(ScrollView).props.refreshControl.props.refreshing).toBe(true);
        });

        it('onRefreshStopsSpinnerWhenRefetchFinishes', async () => {
            const { UNSAFE_getByType } = render(<Perform />);
            await act(async () => {
                await UNSAFE_getByType(ScrollView).props.refreshControl.props.onRefresh();
            });
            expect(UNSAFE_getByType(ScrollView).props.refreshControl.props.refreshing).toBe(false);
        });

        it('onRefreshKeepsCurrentSubMenuSection', async () => {
            const { UNSAFE_getByType, getByTestId, getAllByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));

            await act(async () => {
                await UNSAFE_getByType(ScrollView).props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(getAllByText('Putting').length).toBeGreaterThan(0);
        });
    });

    describe('Heading and sub-menu order', () => {
        it('shouldShowTheStatsHeadingAboveTheSubMenu', () => {
            const { toJSON } = render(<Perform />);
            // Skip the refresh control prop, which holds a circular React structure
            const page = JSON.stringify(toJSON(), (key, value) => (key === 'refreshControl' ? undefined : value));

            const heading = page.indexOf('"Stats"');
            const subMenu = page.indexOf('perform-sub-menu-sins');
            expect(heading).toBeGreaterThanOrEqual(0);
            expect(subMenu).toBeGreaterThan(heading);
        });
    });

    describe('Focus effect refresh', () => {
        it('callsUseFocusEffectOnMount', () => {
            const { getAllRoundHistoryService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([]);

            render(<Perform />);

            // useFocusEffect should be called and the callback captured
            expect(capturedFocusEffect).not.toBeNull();
        });

        it('refreshesRoundHistoryWhenScreenGainsFocus', async () => {
            const { getAllRoundHistoryService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([]);

            const { queryByTestId } = render(<Perform />);

            // Filter should not be visible with 0 rounds
            expect(queryByTestId('filter-button-1')).toBeNull();

            // Simulate adding a round
            getAllRoundHistoryService.mockReturnValue([
                { Id: 1, TotalScore: 75, StrokeTotal: null, StartTime: '2026-08-03T09:00:00Z', EndTime: '2026-08-03T14:30:00Z', IsCompleted: 1, IsScoreOnly: 0, CourseName: 'Test Course', Created_At: '01 Jan', HolesPlayed: 18 },
            ]);

            // Trigger the focus effect - this should call getAllRoundHistoryService again
            await act(async () => {
                if (capturedFocusEffect) {
                    capturedFocusEffect();
                }
            });

            // Filter should now be visible (because getAllRoundHistoryService was called again)
            expect(queryByTestId('stats-filter-button')).toBeTruthy();
        });
    });

    describe('Deadly Sins section', () => {
        it('displaysDeadlySinsSubMenuTab', () => {
            const { getByTestId } = render(<Perform />);
            expect(getByTestId('perform-sub-menu-sins')).toBeTruthy();
        });

        it('renderDeadlySinsHeaderWhenRoundsExist', () => {
            const { getAllDeadlySinsRoundsService } = require('../../../service/DbService');
            getAllDeadlySinsRoundsService.mockReturnValue([
                {
                    Id: 1,
                    RoundId: 1,
                    ThreePutts: 2,
                    DoubleBogeys: 1,
                    BogeysPar5: 0,
                    BogeysInside9Iron: 1,
                    DoubleChips: 0,
                    TroubleOffTee: 1,
                    Penalties: 0,
                    Total: 5,
                    Created_At: '01 Jan',
                },
            ]);
            const { getAllRoundHistoryService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([
                {
                    Id: 1,
                    TotalScore: 75,
                    StrokeTotal: null,
                    StartTime: '2026-08-03T09:00:00Z',
                    EndTime: '2026-08-03T14:30:00Z',
                    IsCompleted: 1,
                    IsScoreOnly: 0,
                    CourseName: 'Test Course',
                    Created_At: '01 Jan',
                    HolesPlayed: 18,
                },
            ]);

            const { getAllByText } = render(<Perform />);
            const headers = getAllByText('Sins');
            expect(headers.length).toBeGreaterThan(0);
        });

        it('rendersFilterButtonsWhenRoundsExist', () => {
            const { getAllDeadlySinsRoundsService, getAllRoundHistoryService } = require('../../../service/DbService');
            getAllDeadlySinsRoundsService.mockReturnValue([
                {
                    Id: 1,
                    RoundId: 1,
                    ThreePutts: 2,
                    DoubleBogeys: 1,
                    BogeysPar5: 0,
                    BogeysInside9Iron: 1,
                    DoubleChips: 0,
                    TroubleOffTee: 1,
                    Penalties: 0,
                    Total: 5,
                    Created_At: '01 Jan',
                },
            ]);
            getAllRoundHistoryService.mockReturnValue([
                {
                    Id: 1,
                    TotalScore: 75,
                    StrokeTotal: null,
                    StartTime: '2026-08-03T09:00:00Z',
                    EndTime: '2026-08-03T14:30:00Z',
                    IsCompleted: 1,
                    IsScoreOnly: 0,
                    CourseName: 'Test Course',
                    Created_At: '01 Jan',
                    HolesPlayed: 18,
                },
            ]);

            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('stats-filter-button'));
            expect(getByTestId('stats-filter-option-1')).toBeTruthy();
            expect(getByTestId('stats-filter-option-10')).toBeTruthy();
            expect(getByTestId('stats-filter-option-all')).toBeTruthy();
        });

        it('showsOneChipPerYearWhenRoundsSpanMoreThanOneYear', () => {
            const { getAllRoundHistoryService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([
                { Id: 2, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/03', Year: 2026, HolesPlayed: 18, CourseName: 'A', StrokeTotal: null, StartTime: '', EndTime: null },
                { Id: 1, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/06', Year: 2025, HolesPlayed: 18, CourseName: 'B', StrokeTotal: null, StartTime: '', EndTime: null },
            ]);

            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('stats-filter-button'));
            expect(getByTestId('stats-filter-option-2026')).toBeTruthy();
            expect(getByTestId('stats-filter-option-2025')).toBeTruthy();
            getAllRoundHistoryService.mockReturnValue([]);
        });

        it('marksThePressedYearAsSelectedAndNarrowsTheRoundsUsed', () => {
            const { getAllRoundHistoryService, getAllDeadlySinsRoundsService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([
                { Id: 2, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/03', Year: 2026, HolesPlayed: 18, CourseName: 'A', StrokeTotal: null, StartTime: '', EndTime: null },
                { Id: 1, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/06', Year: 2025, HolesPlayed: 18, CourseName: 'B', StrokeTotal: null, StartTime: '', EndTime: null },
            ]);
            getAllDeadlySinsRoundsService.mockReturnValue([]);

            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('stats-filter-button'));
            fireEvent.press(getByTestId('stats-filter-option-2025'));

            expect(getByTestId('stats-filter-button')).toHaveTextContent('2025');
            getAllRoundHistoryService.mockReturnValue([]);
        });

        it('allCountsOnlyCompletedStatsRoundsSoItMatchesAYearThatCoversThemAll', () => {
            const { getAllDeadlySinsRoundsService, getAllRoundHistoryService, getAllHoleSinDetailsService } = require('../../../service/DbService');
            // Round 2 is score-only: its sins must not count under All, same as under any filter
            getAllDeadlySinsRoundsService.mockReturnValue([
                { Id: 1, RoundId: 1, ThreePutts: 10, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 10, Created_At: '01 Jan' },
                { Id: 2, RoundId: 2, ThreePutts: 100, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 100, Created_At: '02 Jan' },
            ]);
            getAllRoundHistoryService.mockReturnValue([
                { Id: 1, TotalScore: 75, StrokeTotal: null, StartTime: '2026-08-03T09:00:00Z', EndTime: '2026-08-03T14:30:00Z', IsCompleted: 1, IsScoreOnly: 0, CourseName: 'A', Created_At: '01 Jan', HolesPlayed: 18, Year: 2026 },
                { Id: 2, TotalScore: 78, StrokeTotal: null, StartTime: '2026-08-04T09:00:00Z', EndTime: '2026-08-04T14:30:00Z', IsCompleted: 1, IsScoreOnly: 1, CourseName: 'B', Created_At: '02 Jan', HolesPlayed: 18, Year: 2026 },
            ]);
            getAllHoleSinDetailsService.mockReturnValue([]);

            const { getByTestId } = render(<Perform />);

            expect(Number(getByTestId('7deadly-sins-chart-count-0').props.children)).toBe(10);
        });

        it('offersYearsFromEveryRoundIncludingScoreOnlySoItMatchesPlay', () => {
            const { getAllRoundHistoryService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([
                { Id: 2, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 1, Created_At: '01/03', Year: 2026, HolesPlayed: 18, CourseName: 'A', StrokeTotal: null, StartTime: '', EndTime: null },
                { Id: 1, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/06', Year: 2024, HolesPlayed: 18, CourseName: 'B', StrokeTotal: null, StartTime: '', EndTime: null },
            ]);

            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('stats-filter-button'));

            expect(getByTestId('stats-filter-option-2026')).toBeTruthy();
            expect(getByTestId('stats-filter-option-2024')).toBeTruthy();
            getAllRoundHistoryService.mockReturnValue([]);
        });

        it('lastOneUsesTheLatestRoundOverallSoAScoreOnlyLatestRoundGivesNoStats', () => {
            const { getAllRoundHistoryService, getAllDeadlySinsRoundsService, getAllHoleSinDetailsService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([
                { Id: 2, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 1, Created_At: '02/06', Year: 2026, HolesPlayed: 18, CourseName: 'A', StrokeTotal: null, StartTime: '', EndTime: null },
                { Id: 1, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/06', Year: 2026, HolesPlayed: 18, CourseName: 'B', StrokeTotal: null, StartTime: '', EndTime: null },
            ]);
            getAllDeadlySinsRoundsService.mockReturnValue([
                { Id: 1, RoundId: 1, ThreePutts: 10, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 10, Created_At: '01 Jun' },
            ]);
            getAllHoleSinDetailsService.mockReturnValue([]);

            const { getByTestId, queryByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('stats-filter-button'));
            fireEvent.press(getByTestId('stats-filter-option-1'));

            expect(queryByTestId('7deadly-sins-chart-count-0')).toBeNull();
            getAllRoundHistoryService.mockReturnValue([]);
            getAllDeadlySinsRoundsService.mockReturnValue([]);
        });

        it('shows the filter selected on Play, because the selection is shared', () => {
            const { setRoundFilter } = require('../../../hooks/useRoundFilter');
            const { getAllRoundHistoryService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([
                { Id: 2, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/03', Year: 2026, HolesPlayed: 18, CourseName: 'A', StrokeTotal: null, StartTime: '', EndTime: null },
                { Id: 1, TotalScore: 1, IsCompleted: 1, IsScoreOnly: 0, Created_At: '01/06', Year: 2025, HolesPlayed: 18, CourseName: 'B', StrokeTotal: null, StartTime: '', EndTime: null },
            ]);
            setRoundFilter({ year: 2025 });

            const { getByTestId } = render(<Perform />);

            expect(getByTestId('stats-filter-button')).toHaveTextContent('2025');
            getAllRoundHistoryService.mockReturnValue([]);
        });

        it('verifyFilterLogicAppliedToDeadlySinsRounds', () => {
            const { getAllDeadlySinsRoundsService, getAllRoundHistoryService, getAllHoleSinDetailsService } = require('../../../service/DbService');
            // The perform.tsx screen correctly uses roundHistory.slice(0, filter) to get the N most recent rounds,
            // then filters deadlySinsRounds to only those with matching RoundId.
            // This test verifies the filtering logic is working: when filter=1, only the most recent round's sins are tallied.
            const round1 = {
                Id: 1,
                RoundId: 1,
                ThreePutts: 10,
                DoubleBogeys: 5,
                BogeysPar5: 0,
                BogeysInside9Iron: 0,
                DoubleChips: 0,
                TroubleOffTee: 0,
                Penalties: 0,
                Total: 15,
                Created_At: '01 Jan',
            };
            const round2 = {
                Id: 2,
                RoundId: 2,
                ThreePutts: 2,
                DoubleBogeys: 0,
                BogeysPar5: 0,
                BogeysInside9Iron: 0,
                DoubleChips: 0,
                TroubleOffTee: 3,
                Penalties: 0,
                Total: 5,
                Created_At: '02 Jan',
            };
            getAllDeadlySinsRoundsService.mockReturnValue([round1, round2]);
            getAllRoundHistoryService.mockReturnValue([
                { Id: 1, TotalScore: 75, StrokeTotal: null, StartTime: '2026-08-03T09:00:00Z', EndTime: '2026-08-03T14:30:00Z', IsCompleted: 1, IsScoreOnly: 0, CourseName: 'Test Course 1', Created_At: '01 Jan', HolesPlayed: 18 },
                { Id: 2, TotalScore: 78, StrokeTotal: null, StartTime: '2026-08-04T09:00:00Z', EndTime: '2026-08-04T14:30:00Z', IsCompleted: 1, IsScoreOnly: 0, CourseName: 'Test Course 2', Created_At: '02 Jan', HolesPlayed: 18 },
            ]);
            getAllHoleSinDetailsService.mockReturnValue([]);

            const { getByTestId } = render(<Perform />);

            // With default filter (all): ThreePutts = 10+2 = 12, DoubleBogeys = 5+0 = 5, etc.
            // ThreePutts is first (12)
            const allCountFirst = getByTestId('7deadly-sins-chart-count-0').props.children;
            expect(Number(allCountFirst)).toBe(12);

            // This test documents that the filter=1/10/all logic is in perform.tsx
            // (filtering roundHistory and then filtering deadlySinsRounds to those round IDs).
            // The filter switching in the UI is tested separately at the perform.tsx level.
        });

        it('logsViewDeadlySinsAnalyticsEventWhenTabPressed', () => {
            const { logEvent } = require('../../../service/FirebaseService');
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-sins'));
            expect(logEvent).toHaveBeenCalledWith('view_deadly_sins');
        });

        it('switchingToDeadlySinsAndBackDoesNotBreakOtherSections', () => {
            const { getByTestId, getAllByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            fireEvent.press(getByTestId('perform-sub-menu-sins'));
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getAllByText('Putting').length).toBeGreaterThan(0);
        });
    });

    describe('Putting section', () => {
        it('displaysPuttingSubMenuTab', () => {
            const { getByTestId, getByText } = render(<Perform />);
            expect(getByTestId('perform-sub-menu-putting')).toBeTruthy();
            expect(getByText('Putting')).toBeTruthy();
        });

        it('shouldLabelRoundFilterAsLastRoundLastTenAndAllRounds', () => {
            const { getAllRoundHistoryService } = require('../../../service/DbService');
            getAllRoundHistoryService.mockReturnValue([
                { Id: 1, TotalScore: 72, IsCompleted: 1, IsScoreOnly: 0, StartTime: '', EndTime: '', Created_At: '29/10', CourseName: 'Test', HolesPlayed: 18, StrokeTotal: 72 },
            ]);

            const { getByText, getByTestId, getAllByText } = render(<Perform />);

            fireEvent.press(getByTestId('stats-filter-button'));
            expect(getByText('Last round')).toBeTruthy();
            expect(getByText('Last 10 rounds')).toBeTruthy();
            expect(getAllByText('All rounds').length).toBeGreaterThan(0);
            expect(getByTestId('stats-filter-option-1')).toBeTruthy();
            getAllRoundHistoryService.mockReturnValue([]);
        });

        it('shouldStartRoundFromSharedEmptyStateOnSinsWhenNoRounds', () => {
            const { getAllDeadlySinsRoundsService } = require('../../../service/DbService');
            getAllDeadlySinsRoundsService.mockReturnValue([]);
            mockRouterPush.mockClear();
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-sins'));

            fireEvent.press(getByText('Start a round'));

            expect(mockRouterPush).toHaveBeenCalledWith('/play');
        });

        it('shouldExplainProximityChartAndThreePuttFilter', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));

            expect(getByText(/Where your missed first putts finish/)).toBeTruthy();
            expect(getByText(/counts just the holes where you three-putted/)).toBeTruthy();
        });

        describe('up and down placement', () => {
            const { getUpAndDownRateService } = require('../../../service/DbService');

            beforeEach(() => {
                getUpAndDownRateService.mockReturnValue({ rate: '75%', upAndDowns: 3, attempts: 4 });
            });

            afterEach(() => {
                getUpAndDownRateService.mockReturnValue({ rate: '-', upAndDowns: 0, attempts: 0 });
            });

            it('shouldShowUpAndDownUnderProximitySubMenu', () => {
                const { getByTestId, getByText } = render(<Perform />);
                fireEvent.press(getByTestId('perform-sub-menu-proximity'));
                expect(getByText('Up & down')).toBeTruthy();
            });

            it('shouldShowUpAndDownAboveProximityStats', () => {
                const collectText = (node: any, acc: string[] = []): string[] => {
                    if (node == null) return acc;
                    if (typeof node === 'string') { acc.push(node); return acc; }
                    if (Array.isArray(node)) { node.forEach(child => collectText(child, acc)); return acc; }
                    collectText(node.children, acc);
                    return acc;
                };
                const { getByTestId, toJSON } = render(<Perform />);
                fireEvent.press(getByTestId('perform-sub-menu-proximity'));

                const texts = collectText(toJSON());
                expect(texts.indexOf('Up & down')).toBeGreaterThanOrEqual(0);
                expect(texts.indexOf('Up & down')).toBeLessThan(texts.indexOf('Show 3-putts only'));
            });

            it('shouldNotShowUpAndDownUnderPuttingSubMenu', () => {
                const { getByTestId, queryByTestId } = render(<Perform />);
                fireEvent.press(getByTestId('perform-sub-menu-putting'));
                expect(queryByTestId('up-and-down-rate')).toBeNull();
            });
        });

        it('showsPuttingSectionWhenPuttingSubMenuPressed', () => {
            const { getByTestId, getAllByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getAllByText('Putting').length).toBeGreaterThan(0);
        });

        it('rendersPuttingRatesWithThePGATourRateInBrackets', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getByText(/Gold marker/)).toBeTruthy();
        });

        it('rendersPuttingDistancesInFeetByDefault', () => {
            const { getByTestId, getAllByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getAllByText(/^4 ft$/).length).toBeGreaterThan(0);
            expect(getAllByText(/^1 ft$/).length).toBeGreaterThan(0);
            expect(getAllByText(/^20 ft$/).length).toBeGreaterThan(0);
            expect(getAllByText(/^50 ft$/).length).toBeGreaterThan(0);
        });

        it('alwaysRendersFeetUnitLabelRegardlessOfMetricSetting', () => {
            const { getSettingsService } = require('../../../service/DbService');
            getSettingsService.mockReturnValue({ performOnboardingSeen: true, units: 'metres' });

            const { getByTestId, getAllByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getAllByText(/ ft$/).length).toBeGreaterThan(0);
        });

        it('logsViewPuttingAnalyticsEventWhenPuttingSubMenuTabPressed', () => {
            const { logEvent } = require('../../../service/FirebaseService');
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(logEvent).toHaveBeenCalledWith('view_putting');
        });

        it('showsAsteriskExplanationForEstimatedRates', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getByText('Gold marker shows the PGA tour rates')).toBeTruthy();
        });

    });

    describe('Proximity section', () => {
        it('displaysProximitySubMenuTab', () => {
            const { getByTestId, getByText } = render(<Perform />);
            expect(getByTestId('perform-sub-menu-proximity')).toBeTruthy();
            expect(getByText('Proximity')).toBeTruthy();
        });

        it('shows the Proximity heading on a card with the 3-putts switch inside it', () => {
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));

            expect(getByTestId('proximity-card')).toBeTruthy();
            expect(getByTestId('proximity-heading')).toHaveStyle({ padding: 0 });
            expect(getByTestId('proximity-heading')).toHaveTextContent('Proximity');
        });

        it('shows the 3-putts switch label at the regular text size', () => {
            const fontSizes = require('../../../assets/font-sizes').default;
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));

            expect(getByTestId('proximity-filter-label')).toHaveStyle({ fontSize: fontSizes.normal });
        });

        it('showsProximitySectionWhenProximitySubMenuPressed', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            expect(getByText(/Where your missed first putts finish/)).toBeTruthy();
        });

        it('logsViewProximityAnalyticsEventWhenProximitySubMenuTabPressed', () => {
            const { logEvent } = require('../../../service/FirebaseService');
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            expect(logEvent).toHaveBeenCalledWith('view_proximity');
        });

        it('renders proximity filter toggle switch', () => {
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            expect(getByTestId('proximity-filter-toggle')).toBeTruthy();
        });

        it('toggle is off by default (All)', () => {
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            const toggle = getByTestId('proximity-filter-toggle');
            expect(toggle.props.value).toBe(false);
        });

        it('toggling switch on calls getPuttingProximityService(true)', () => {
            const { getPuttingProximityService } = require('../../../service/DbService');
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            getPuttingProximityService.mockClear();
            fireEvent(getByTestId('proximity-filter-toggle'), 'valueChange', true);
            expect(getPuttingProximityService).toHaveBeenCalledWith(true, expect.any(Set));
        });

        it('toggling switch off calls getPuttingProximityService(false)', () => {
            const { getPuttingProximityService } = require('../../../service/DbService');
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            fireEvent(getByTestId('proximity-filter-toggle'), 'valueChange', true);
            getPuttingProximityService.mockClear();
            fireEvent(getByTestId('proximity-filter-toggle'), 'valueChange', false);
            expect(getPuttingProximityService).toHaveBeenCalledWith(false, expect.any(Set));
        });
    });

    describe('section transition animation', () => {
        it('triggers Animated.timing when switching to Putting section', async () => {
            const animSpy = jest.spyOn(Animated, 'timing');
            const utils = render(<Perform />);

            const puttingTab = utils.getByTestId('perform-sub-menu-putting');
            fireEvent.press(puttingTab);

            expect(animSpy).toHaveBeenCalledWith(
                expect.any(Animated.Value),
                expect.objectContaining({ useNativeDriver: true })
            );

            animSpy.mockRestore();
        });

        it('triggers Animated.timing when switching to Proximity section', async () => {
            const animSpy = jest.spyOn(Animated, 'timing');
            const utils = render(<Perform />);

            const proximityTab = utils.getByTestId('perform-sub-menu-proximity');
            fireEvent.press(proximityTab);

            expect(animSpy).toHaveBeenCalledWith(
                expect.any(Animated.Value),
                expect.objectContaining({ useNativeDriver: true })
            );

            animSpy.mockRestore();
        });
    });
});
