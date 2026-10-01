import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';

import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    getAllDeadlySinsRoundsService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    getSettingsService,
    saveSettingsService,
    getHolesPlayedForRoundService,
    loadCourseNotesService,
    getHolesWithSinsForRoundService,
    _PENALTY_TYPES,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder } from '../../service/NotificationService';
import { logEvent } from '../../service/FirebaseService';
import { maybeRequestRoundReviewService } from '../../service/ReviewService';

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
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../service/DbService', () => ({
    startRoundService: jest.fn(),
    endRoundService: jest.fn(),
    addMultiplayerHoleScoresService: jest.fn(),
    getActiveRoundService: jest.fn(),
    getAllRoundHistoryService: jest.fn(),
    insertHoleDeadlySinsService: jest.fn().mockResolvedValue(true),
    getAllDeadlySinsRoundsService: jest.fn(),
    getClubDistancesService: jest.fn().mockReturnValue([]),
    getWedgeChartService: jest.fn().mockReturnValue({ distanceNames: [], clubs: [] }),
    saveWedgeChartService: jest.fn(),
    addRoundPlayersService: jest.fn(),
    getRoundPlayersService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    getRecentCourseNamesService: jest.fn(),
    getRecentPlayerNamesService: jest.fn(),
    getHolesPlayedForRoundService: jest.fn().mockReturnValue(0),
    getCourseHoleParsService: jest.fn().mockReturnValue({}),
    loadCourseNotesService: jest.fn().mockReturnValue({}),
    saveHoleNoteService: jest.fn().mockResolvedValue(true),
    getParAveragesService: jest.fn().mockReturnValue({ par3: null, par4: null, par5: null }),
    getHoleDeadlySinsService: jest.fn().mockReturnValue(null),
    getHoleScoresService: jest.fn().mockReturnValue(null),
    getHolesWithSinsForRoundService: jest.fn().mockReturnValue(new Set()),
    getPuttingStatsService: jest.fn().mockReturnValue(null),
    insertPuttingStatsService: jest.fn().mockResolvedValue(true),
    insertHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    getHoleSinDetailsService: jest.fn().mockReturnValue(null),
    deleteHoleSinDetailsService: jest.fn().mockResolvedValue(true),
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
        homeOnboardingSeen: true,
        practiceOnboardingSeen: true,
        reviewPromptShown: false,
        skipStatsFlowEnabled: false,
        preShotReminderEnabled: true,
        badHoleReassuranceEnabled: true,
    } as any),
    saveSettingsService: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../service/ReviewService', () => ({
    maybeRequestRoundReviewService: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../database/db', () => ({
    getWedgeChartDistanceNames: jest.fn().mockReturnValue([]),
    getWedgeChartEntries: jest.fn().mockReturnValue([]),
}));

const mockToastShow = jest.fn();
jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: mockToastShow,
    }),
}));

jest.mock('../../service/NotificationService', () => ({
    scheduleRoundReminder: jest.fn(),
    cancelRoundReminder: jest.fn(),
    cancelAllRoundReminders: jest.fn(),
}));

jest.mock('../../service/FirebaseService', () => ({
    logEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: { Medium: 'medium' },
}));

const mockPush = jest.fn();
const mockSetOptions = jest.fn();
jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        useRouter: () => ({
            push: mockPush,
        }),
        useNavigation: () => ({
            setOptions: mockSetOptions,
        }),
        useFocusEffect: (cb: () => void) => { capturedFocusEffect = cb; },
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <View testID={`link-${href}`}>{children}</View>
        ),
    };
});

const mockRefreshWind = jest.fn();
let mockWindValue: { directionFrom: number; speedMph: number } | null = { directionFrom: 270, speedMph: 12 };
jest.mock('../../hooks/useWind', () => ({
    useWind: () => ({ wind: mockWindValue, heading: 0, refreshWind: mockRefreshWind }),
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

const mockStartRound = startRoundService as jest.Mock;
const mockEndRound = endRoundService as jest.Mock;
const mockAddMultiplayerHoleScores = addMultiplayerHoleScoresService as jest.Mock;
const mockGetActiveRound = getActiveRoundService as jest.Mock;
const mockGetAllRoundHistory = getAllRoundHistoryService as jest.Mock;
const mockGetAllDeadlySinsRounds = getAllDeadlySinsRoundsService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockScheduleReminder = scheduleRoundReminder as jest.Mock;
const mockCancelReminder = cancelRoundReminder as jest.Mock;
const mockAddRoundPlayers = addRoundPlayersService as jest.Mock;
const mockGetRoundPlayers = getRoundPlayersService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockLogEvent = logEvent as jest.Mock;
const mockGetRecentCourseNames = getRecentCourseNamesService as jest.Mock;
const mockGetRecentPlayerNames = getRecentPlayerNamesService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;
const mockMaybeRequestReview = maybeRequestRoundReviewService as jest.Mock;
const mockGetHolesPlayedForRound = getHolesPlayedForRoundService as jest.Mock;
const mockLoadCourseNotes = loadCourseNotesService as jest.Mock;
const mockGetHolesWithSinsForRound = getHolesWithSinsForRoundService as jest.Mock;

describe('Play screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRound.mockReturnValue(null);
        mockGetAllRoundHistory.mockReturnValue([]);
        mockGetAllDeadlySinsRounds.mockReturnValue([]);
        mockGetClubDistances.mockReturnValue([]);
        mockGetRoundPlayers.mockReturnValue([]);
        mockGetMultiplayerScorecard.mockReturnValue(null);
        mockGetRecentCourseNames.mockReturnValue([]);
        mockGetRecentPlayerNames.mockReturnValue([]);
        mockGetHolesPlayedForRound.mockReturnValue(0);
        mockLoadCourseNotes.mockReturnValue({});
        mockGetHolesWithSinsForRound.mockReturnValue(new Set());
    });

    describe('Notifications', () => {
        it('schedules a reminder when starting a round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockScheduleReminder.mockResolvedValue('notif-123');

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockScheduleReminder).toHaveBeenCalled();
            });
        });

        it('cancels the reminder when ending a round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockScheduleReminder.mockResolvedValue('notif-123');
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('confirm-end-round-button'));
            });

            await waitFor(() => {
                expect(mockCancelReminder).toHaveBeenCalledWith('notif-123');
            });
        });
    });

    describe('Onboarding', () => {
        it('shows onboarding when playOnboardingSeen is false and no round history', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: false,
            });

            const { getByTestId } = render(<Play />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('does not show onboarding when playOnboardingSeen is true', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: true,
            });

            const { queryByTestId } = render(<Play />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('does not show onboarding when round history exists', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: false,
            });
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { queryByTestId } = render(<Play />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });

        it('dismisses onboarding and saves settings when Skip pressed', async () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: false,
            });
            mockSaveSettingsService.mockResolvedValue(true);

            const { getByTestId, queryByTestId } = render(<Play />);

            expect(getByTestId('onboarding-overlay')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('skip-button'));
            });

            expect(queryByTestId('onboarding-overlay')).toBeNull();
            expect(mockSaveSettingsService).toHaveBeenCalledWith(expect.objectContaining({
                playOnboardingSeen: true,
            }));
        });

        it('shows onboarding when info button pressed', async () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: true,
            });

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-onboarding-info-button'));

            expect(getByTestId('onboarding-overlay')).toBeTruthy();
        });

        it('does not show onboarding during active round', () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: false,
            });
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 0,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);

            const { queryByTestId } = render(<Play />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });
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
            const { UNSAFE_getByType, getByText } = render(<Play />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });

            expect(getByText('Release to update')).toBeTruthy();
        });

        it('onRefreshHidesOverlayAfterTimeout', async () => {
            const { UNSAFE_getByType, queryByText } = render(<Play />);
            const scrollView = UNSAFE_getByType(ScrollView);

            await act(async () => {
                await scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(queryByText('Release to update')).toBeNull();
        });

        it('onRefreshCallsGetAllRoundHistoryService', () => {
            const { UNSAFE_getByType } = render(<Play />);
            const scrollView = UNSAFE_getByType(ScrollView);

            const initialCount = mockGetAllRoundHistory.mock.calls.length;

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(mockGetAllRoundHistory.mock.calls.length).toBeGreaterThan(initialCount);
        });
    });

    describe('Review prompt', () => {
        const completeRoundToScorecard = async (getByTestId: (id: string) => unknown) => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockEndRound.mockResolvedValue(true);
            mockGetMultiplayerScorecard.mockReturnValue({
                players: [{ Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 }],
                holeScores: [],
            });

            fireEvent.press(getByTestId('start-round-button') as never);
            fireEvent.changeText(getByTestId('course-name-input') as never, 'Test Course');
            fireEvent.press(getByTestId('start-button') as never);
            await waitFor(() => expect(getByTestId('end-round-button')).toBeTruthy());
            fireEvent.press(getByTestId('end-round-button') as never);
            await waitFor(() => expect(getByTestId('confirm-end-round-button')).toBeTruthy());
            fireEvent.press(getByTestId('confirm-end-round-button') as never);
            await waitFor(() => expect(getByTestId('scorecard-done-button')).toBeTruthy());
        };

        beforeEach(() => {
            mockMaybeRequestReview.mockResolvedValue(false);
            mockGetSettingsService.mockReturnValue({
                theme: 'dark', notificationsEnabled: true, wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true, playOnboardingSeen: true, homeOnboardingSeen: true,
                practiceOnboardingSeen: true, reviewPromptShown: false,
            });
        });

        it('checksReviewPromptWithRoundCountWhenScorecardDonePressed', async () => {
            mockGetAllRoundHistory.mockReturnValue([{ Id: 1 }]);
            const { getByTestId } = render(<Play />);
            await completeRoundToScorecard(getByTestId);

            await act(async () => { fireEvent.press(getByTestId('scorecard-done-button')); });

            await waitFor(() => expect(mockMaybeRequestReview).toHaveBeenCalledWith(1));
        });

        it('logsReviewEventWhenPrompted', async () => {
            mockGetAllRoundHistory.mockReturnValue([{ Id: 1 }]);
            mockMaybeRequestReview.mockResolvedValue(true);
            const { getByTestId } = render(<Play />);
            await completeRoundToScorecard(getByTestId);

            await act(async () => { fireEvent.press(getByTestId('scorecard-done-button')); });

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith('review_requested', expect.objectContaining({ roundNumber: 1 }));
            });
        });

        it('doesNotLogReviewEventWhenNotPrompted', async () => {
            mockGetAllRoundHistory.mockReturnValue([{ Id: 1 }]);
            mockMaybeRequestReview.mockResolvedValue(false);
            const { getByTestId } = render(<Play />);
            await completeRoundToScorecard(getByTestId);
            mockLogEvent.mockClear();

            await act(async () => { fireEvent.press(getByTestId('scorecard-done-button')); });

            await waitFor(() => expect(mockMaybeRequestReview).toHaveBeenCalled());
            expect(mockLogEvent).not.toHaveBeenCalledWith('review_requested', expect.anything());
        });
    });

    describe('Pre-shot routine reminder', () => {
        const settingsWith = (overrides: Record<string, unknown>) => ({
            theme: 'dark', notificationsEnabled: true, wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: true, playOnboardingSeen: true, homeOnboardingSeen: true,
            practiceOnboardingSeen: true, reviewPromptShown: false, ...overrides,
        });

        const startRound = (getByTestId: (id: string) => unknown) => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            fireEvent.press(getByTestId('start-round-button') as never);
            fireEvent.changeText(getByTestId('course-name-input') as never, 'Test Course');
            fireEvent.press(getByTestId('start-button') as never);
        };

        it('showsRoutineTextInlineWhenRoundStarts', async () => {
            mockGetSettingsService.mockReturnValue(settingsWith({ preShotReminderEnabled: true, preShotRoutineText: 'Target, breathe, go' }));

            const { getByTestId, getByText, queryByTestId } = render(<Play />);
            startRound(getByTestId);

            await waitFor(() => expect(getByText('Target, breathe, go')).toBeTruthy());
            expect(queryByTestId('acknowledge-overlay')).toBeNull();
        });

        it('routineTextPersistsAfterAdvancingToNextHole', async () => {
            mockGetSettingsService.mockReturnValue(settingsWith({ preShotReminderEnabled: true, preShotRoutineText: 'Routine text' }));

            const { getByTestId, getByText } = render(<Play />);
            startRound(getByTestId);

            await waitFor(() => expect(getByText('Routine text')).toBeTruthy());
            fireEvent.press(getByTestId('next-hole-button'));

            await waitFor(() => expect(getByText('Routine text')).toBeTruthy());
        });

        it('doesNotShowReminderWhenDisabled', async () => {
            mockGetSettingsService.mockReturnValue(settingsWith({ preShotReminderEnabled: false, preShotRoutineText: 'Routine' }));

            const { getByTestId, queryByText } = render(<Play />);
            startRound(getByTestId);

            await waitFor(() => expect(getByTestId('end-round-button')).toBeTruthy());
            expect(queryByText('Routine')).toBeNull();
        });
    });

    describe('Bad hole reassurance splash', () => {
        it('shows splash in score-only mode after triple-bogey score entry', async () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: true,
                homeOnboardingSeen: true,
                practiceOnboardingSeen: true,
                reviewPromptShown: false,
                skipStatsFlowEnabled: true,
                badHoleReassuranceEnabled: true,
            });

            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null, Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 1,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);
            mockGetHolesPlayedForRound.mockReturnValue(0);

            const { getByTestId, queryByTestId } = render(<Play />);
            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            await waitFor(() => expect(queryByTestId('increment-1')).toBeTruthy());

            // Score triple bogey in score-only mode (hole 1 par 4, increment 3x to get 7)
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('next-hole-button'));

            // Splash should appear immediately (no stats/putting steps in score-only mode)
            await waitFor(() => expect(getByTestId('acknowledge-overlay')).toBeTruthy());
        });

        it('does not show splash for double-bogey (par + 2) or better in score-only mode', async () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: true,
                homeOnboardingSeen: true,
                practiceOnboardingSeen: true,
                reviewPromptShown: false,
                skipStatsFlowEnabled: true,
                badHoleReassuranceEnabled: true,
            });

            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null, Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 1,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);
            mockGetHolesPlayedForRound.mockReturnValue(0);

            const { getByTestId, queryByTestId } = render(<Play />);
            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            await waitFor(() => expect(queryByTestId('increment-1')).toBeTruthy());

            // Score double bogey (par 4 + 2 = 6, so increment 2x)
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('next-hole-button'));

            // Splash should NOT appear for double-bogey
            await waitFor(() => expect(queryByTestId('next-hole-button')).toBeTruthy());
            expect(queryByTestId('acknowledge-overlay')).toBeNull();
        });

        it('does not show splash when badHoleReassuranceEnabled is false in score-only mode', async () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: true,
                homeOnboardingSeen: true,
                practiceOnboardingSeen: true,
                reviewPromptShown: false,
                skipStatsFlowEnabled: true,
                badHoleReassuranceEnabled: false,
            });

            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null, Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 1,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);
            mockGetHolesPlayedForRound.mockReturnValue(0);

            const { getByTestId, queryByTestId } = render(<Play />);
            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            await waitFor(() => expect(queryByTestId('increment-1')).toBeTruthy());

            // Score triple bogey
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('next-hole-button'));

            // Splash should NOT appear when disabled
            await waitFor(() => expect(queryByTestId('next-hole-button')).toBeTruthy());
            expect(queryByTestId('acknowledge-overlay')).toBeNull();
        });

        it('advances to next hole when splash is dismissed in score-only mode', async () => {
            mockGetSettingsService.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                wedgeChartOnboardingSeen: true,
                distancesOnboardingSeen: true,
                playOnboardingSeen: true,
                homeOnboardingSeen: true,
                practiceOnboardingSeen: true,
                reviewPromptShown: false,
                skipStatsFlowEnabled: true,
                badHoleReassuranceEnabled: true,
            });

            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null, Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 1,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);
            mockGetHolesPlayedForRound.mockReturnValue(0);

            const { getByTestId, queryByTestId, getByText } = render(<Play />);
            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            await waitFor(() => expect(queryByTestId('increment-1')).toBeTruthy());

            // Score triple bogey on hole 1
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('next-hole-button'));

            // Wait for splash to appear
            await waitFor(() => expect(getByTestId('acknowledge-overlay')).toBeTruthy());

            // Dismiss splash
            fireEvent.press(getByTestId('acknowledge-dismiss'));

            // Hole should advance to hole 2
            await waitFor(() => expect(getByText('#2')).toBeTruthy());
        });
    });
});
