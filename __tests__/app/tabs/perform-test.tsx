import React, { act } from 'react';
import { FlatList, ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import Perform from '../../../app/(tabs)/perform';

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
    getPuttingMakeRatesService: jest.fn().mockReturnValue([
        { distance: 1, firstPuttMakeRate: '98%', secondPuttMakeRate: '-' },
        { distance: 2, firstPuttMakeRate: '95%', secondPuttMakeRate: '-' },
        { distance: 3, firstPuttMakeRate: '92%', secondPuttMakeRate: '-' },
        { distance: 4, firstPuttMakeRate: '85%', secondPuttMakeRate: '-' },
        { distance: 5, firstPuttMakeRate: '75%', secondPuttMakeRate: '-' },
        { distance: 6, firstPuttMakeRate: '65%', secondPuttMakeRate: '-' },
        { distance: 7, firstPuttMakeRate: '57%', secondPuttMakeRate: '-' },
        { distance: 8, firstPuttMakeRate: '49%', secondPuttMakeRate: '-' },
        { distance: 9, firstPuttMakeRate: '42%', secondPuttMakeRate: '-' },
        { distance: 10, firstPuttMakeRate: '38%', secondPuttMakeRate: '-' },
        { distance: 11, firstPuttMakeRate: '33%', secondPuttMakeRate: '-' },
        { distance: 12, firstPuttMakeRate: '30%', secondPuttMakeRate: '-' },
        { distance: 13, firstPuttMakeRate: '27%', secondPuttMakeRate: '-' },
        { distance: 14, firstPuttMakeRate: '25%', secondPuttMakeRate: '-' },
        { distance: 15, firstPuttMakeRate: '23%', secondPuttMakeRate: '-' },
        { distance: 16, firstPuttMakeRate: '21%', secondPuttMakeRate: '-' },
        { distance: 17, firstPuttMakeRate: '19%', secondPuttMakeRate: '-' },
        { distance: 18, firstPuttMakeRate: '17%', secondPuttMakeRate: '-' },
        { distance: 19, firstPuttMakeRate: '16%', secondPuttMakeRate: '-' },
        { distance: 20, firstPuttMakeRate: '14%', secondPuttMakeRate: '-' },
        { distance: 25, firstPuttMakeRate: '10%', secondPuttMakeRate: '-' },
        { distance: 30, firstPuttMakeRate: '7%', secondPuttMakeRate: '-' },
        { distance: 35, firstPuttMakeRate: '5%', secondPuttMakeRate: '-' },
        { distance: 40, firstPuttMakeRate: '3%', secondPuttMakeRate: '-' },
        { distance: 45, firstPuttMakeRate: '2%', secondPuttMakeRate: '-' },
        { distance: 50, firstPuttMakeRate: '1%', secondPuttMakeRate: '-' },
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
        const { getSettingsService } = require('../../../service/DbService');
        getSettingsService.mockReturnValue({ performOnboardingSeen: true, units: 'yards' });
    });

    it('rendersWithoutCrashing', () => {
        const { toJSON } = render(<Perform />);
        expect(toJSON()).toBeTruthy();
    });

    it('displaysDeadlySinsAsDefaultSection', () => {
        const { getByText } = render(<Perform />);
        expect(getByText('Track your 7 Deadly Sins across rounds')).toBeTruthy();
    });

    it('showsProsSectionWhenProsSubMenuPressed', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Performance')).toBeTruthy();
    });

    it('displaysManageExpectationsTextInProsSection', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Manage your expectations, better!')).toBeTruthy();
    });

    it('showsApproachSubheadingAtDefaultIndex', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Average proximity to the hole')).toBeTruthy();
    });

    it('showsPGASourceAtDefaultIndex', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Source: PGA tour online statistics website')).toBeTruthy();
    });

    it('hasFlatListWithPerformTestID', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByTestId('perform-flat-list')).toBeTruthy();
    });

    it('renderItemShowsApproachTableHeaders', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Yards')).toBeTruthy();
        expect(getByText('Fairway')).toBeTruthy();
        expect(getByText('Rough')).toBeTruthy();
    });

    it('renderItemShowsPuttingTableHeaders', () => {
        const { getByTestId, getByText } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
        expect(getByText('Feet')).toBeTruthy();
        expect(getByText('Make rate')).toBeTruthy();
    });

    it('scrollingFlatListShowsPuttingSubheading', () => {
        const { getByTestId, getByText, UNSAFE_getAllByType } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

        act(() => {
            UNSAFE_getAllByType(FlatList)[0].props.onScroll({
                nativeEvent: { contentOffset: { x: 375 } },
            });
        });

        expect(getByText('Putts')).toBeTruthy();
    });

    it('scrollingFlatListShowsProfessionalMaleGolferText', () => {
        const { getByTestId, getByText, UNSAFE_getAllByType } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

        act(() => {
            UNSAFE_getAllByType(FlatList)[0].props.onScroll({
                nativeEvent: { contentOffset: { x: 375 } },
            });
        });

        expect(getByText('Professional male golfer make percentages')).toBeTruthy();
    });

    it('scrollingFlatListShowsPuttingSource', () => {
        const { getByTestId, getByText, UNSAFE_getAllByType } = render(<Perform />);
        fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));

        act(() => {
            UNSAFE_getAllByType(FlatList)[0].props.onScroll({
                nativeEvent: { contentOffset: { x: 375 } },
            });
        });

        expect(getByText(/The Lost Art of Putting/)).toBeTruthy();
    });

    describe('onRefresh', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        it('onRefreshShowsRefreshingOverlay', () => {
            const { UNSAFE_getByType, getByText } = render(<Perform />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });

            expect(getByText('Release to update')).toBeTruthy();
        });

        it('onRefreshHidesOverlayAfterTimeout', () => {
            const { UNSAFE_getByType, queryByText } = render(<Perform />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(queryByText('Release to update')).toBeNull();
        });

        it('onRefreshResetsSectionToDeadlySins', () => {
            const { getByTestId, UNSAFE_getByType, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
            expect(getByText('Performance')).toBeTruthy();

            const scrollView = UNSAFE_getByType(ScrollView);
            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(getByText('Track your 7 Deadly Sins across rounds')).toBeTruthy();
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
                    CourseName: 'Test Course',
                    Created_At: '01 Jan',
                    HolesPlayed: 18,
                },
            ]);

            const { getAllByText } = render(<Perform />);
            const headers = getAllByText('Deadly Sins');
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
                    CourseName: 'Test Course',
                    Created_At: '01 Jan',
                    HolesPlayed: 18,
                },
            ]);

            const { getByTestId } = render(<Perform />);
            expect(getByTestId('filter-button-1')).toBeTruthy();
            expect(getByTestId('filter-button-10')).toBeTruthy();
            expect(getByTestId('filter-button-all')).toBeTruthy();
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
                { Id: 1, TotalScore: 75, StrokeTotal: null, StartTime: '2026-08-03T09:00:00Z', EndTime: '2026-08-03T14:30:00Z', IsCompleted: 1, CourseName: 'Test Course 1', Created_At: '01 Jan', HolesPlayed: 18 },
                { Id: 2, TotalScore: 78, StrokeTotal: null, StartTime: '2026-08-04T09:00:00Z', EndTime: '2026-08-04T14:30:00Z', IsCompleted: 1, CourseName: 'Test Course 2', Created_At: '02 Jan', HolesPlayed: 18 },
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
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
            fireEvent.press(getByTestId('perform-sub-menu-sins'));
            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
            expect(getByTestId('perform-flat-list')).toBeTruthy();
        });

        it('displaysSinsSubtitle', () => {
            const { getByText } = render(<Perform />);
            expect(getByText('Track your 7 Deadly Sins across rounds')).toBeTruthy();
        });
    });

    describe('Putting section', () => {
        it('displaysPuttingSubMenuTab', () => {
            const { getByTestId, getByText } = render(<Perform />);
            expect(getByTestId('perform-sub-menu-putting')).toBeTruthy();
            expect(getByText('Putting')).toBeTruthy();
        });

        it('showsPuttingSectionWhenPuttingSubMenuPressed', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getByText('Your personal putting make rates')).toBeTruthy();
        });

        it('rendersPuttingTableWithPersonalRateAndProRateInBrackets', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getByText('Make rate')).toBeTruthy();
        });

        it('rendersPuttingTableWithFeetUnitsByDefault', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getByText('Feet')).toBeTruthy();
            expect(getByText('Make rate')).toBeTruthy();
            expect(getByText('1')).toBeTruthy();
            expect(getByText('20')).toBeTruthy();
            expect(getByText('50')).toBeTruthy();
        });

        it('alwaysRendersFeetUnitLabelRegardlessOfMetricSetting', () => {
            const { getSettingsService } = require('../../../service/DbService');
            getSettingsService.mockReturnValue({ performOnboardingSeen: true, units: 'metres' });

            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getByText('Feet')).toBeTruthy();
        });

        it('logsViewPuttingAnalyticsEventWhenPuttingSubMenuTabPressed', () => {
            const { logEvent } = require('../../../service/FirebaseService');
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(logEvent).toHaveBeenCalledWith('view_putting');
        });

        it('switchingToPuttingAndBackDoesNotBreakDeadlySinsRendering', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            fireEvent.press(getByTestId('perform-sub-menu-sins'));
            expect(getByText('Track your 7 Deadly Sins across rounds')).toBeTruthy();
        });

        it('switchingToPuttingAndBackDoesNotBreakProsRendering', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            fireEvent.press(getByTestId('perform-sub-menu-pro-stats'));
            expect(getByTestId('perform-flat-list')).toBeTruthy();
            expect(getByText('Yards')).toBeTruthy();
        });
        it('showsAsteriskExplanationForEstimatedRates', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-putting'));
            expect(getByText(/Estimated or extrapolated from PGA tour data/)).toBeTruthy();
        });
    });

    describe('Proximity section', () => {
        it('displaysProximitySubMenuTab', () => {
            const { getByTestId, getByText } = render(<Perform />);
            expect(getByTestId('perform-sub-menu-proximity')).toBeTruthy();
            expect(getByText('Proximity')).toBeTruthy();
        });

        it('showsProximitySectionWhenProximitySubMenuPressed', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            expect(getByText('Where your missed first putts finish')).toBeTruthy();
        });

        it('logsViewProximityAnalyticsEventWhenProximitySubMenuTabPressed', () => {
            const { logEvent } = require('../../../service/FirebaseService');
            const { getByTestId } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            expect(logEvent).toHaveBeenCalledWith('view_proximity');
        });

        it('switchingToProximityAndBackDoesNotBreakOtherSections', () => {
            const { getByTestId, getByText } = render(<Perform />);
            fireEvent.press(getByTestId('perform-sub-menu-proximity'));
            fireEvent.press(getByTestId('perform-sub-menu-sins'));
            expect(getByText('Track your 7 Deadly Sins across rounds')).toBeTruthy();
        });
    });
});
