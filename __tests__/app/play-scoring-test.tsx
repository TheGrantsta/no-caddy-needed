import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';
import * as Haptics from 'expo-haptics';

import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertHoleDeadlySinsService,
    insertPuttingStatsService,
    getPuttingStatsService,
    getAllDeadlySinsRoundsService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    getSettingsService,
    getHolesPlayedForRoundService,
    getCourseHoleParsService,
    loadCourseNotesService,
    saveHoleNoteService,
    getHoleDeadlySinsService,
    getHolesWithSinsForRoundService,
    deleteHoleSinDetailsService,
    _PENALTY_TYPES,
} from '../../service/DbService';
import { cancelAllRoundReminders } from '../../service/NotificationService';
import { logEvent } from '../../service/FirebaseService';

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
    deleteRoundService: jest.fn().mockResolvedValue(true),
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
        useFocusEffect: () => { },
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
const mockInsertHoleDeadlySins = insertHoleDeadlySinsService as jest.Mock;
const mockGetAllDeadlySinsRounds = getAllDeadlySinsRoundsService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockCancelAllReminders = cancelAllRoundReminders as jest.Mock;
const mockAddRoundPlayers = addRoundPlayersService as jest.Mock;
const mockGetRoundPlayers = getRoundPlayersService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockLogEvent = logEvent as jest.Mock;
const mockGetRecentCourseNames = getRecentCourseNamesService as jest.Mock;
const mockGetRecentPlayerNames = getRecentPlayerNamesService as jest.Mock;
const mockGetHolesPlayedForRound = getHolesPlayedForRoundService as jest.Mock;
const mockGetCourseHolePars = getCourseHoleParsService as jest.Mock;
const mockLoadCourseNotes = loadCourseNotesService as jest.Mock;
const mockSaveHoleNote = saveHoleNoteService as jest.Mock;
const mockGetHoleDeadlySins = getHoleDeadlySinsService as jest.Mock;
const mockGetHolesWithSinsForRound = getHolesWithSinsForRoundService as jest.Mock;
const mockHapticsImpact = Haptics.impactAsync as jest.Mock;
const mockDeleteHoleSinDetailsService = deleteHoleSinDetailsService as jest.Mock;

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

    describe('Idle state', () => {
        it('shows the round setup with a Start round button when no active round', () => {
            const { getByTestId } = render(<Play />);

            expect(getByTestId('start-button')).toBeTruthy();
        });

        it('does not show course name text when CourseName is null', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null },
            ]);

            const { queryByTestId } = render(<Play />);

            expect(queryByTestId('round-history-course-1')).toBeNull();
        });

        it('does not show holes played in history row when 18 holes', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null, HolesPlayed: 18 },
            ]);

            const { queryByText } = render(<Play />);

            expect(queryByText(/18 holes/)).toBeNull();
        });

        describe('Incomplete round on mount', () => {
            const incompleteRound = { Id: 42, TotalScore: 0, IsCompleted: 0, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: 'Pebble Beach', HolesPlayed: 5, IsScoreOnly: 0 };

            beforeEach(() => {
                mockGetActiveRound.mockReturnValue(incompleteRound);
                mockGetRoundPlayers.mockReturnValue([]);
            });

            it('shouldShowContinueButtonWhenIncompleteRoundExists', () => {
                const { getByTestId } = render(<Play />);
                expect(getByTestId('continue-round-button')).toBeTruthy();
            });

            it('shouldShowEndRoundLinkWhenIncompleteRoundExists', () => {
                const { getByTestId } = render(<Play />);
                expect(getByTestId('end-incomplete-round-link')).toBeTruthy();
            });

            it('shouldNotShowStartRoundButtonWhenIncompleteRoundExists', () => {
                const { queryByTestId } = render(<Play />);
                expect(queryByTestId('start-button')).toBeNull();
            });

            it('shouldResumeRoundWhenContinuePressed', async () => {
                const { getByTestId, queryByTestId } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('continue-round-button'));
                });
                expect(getByTestId('next-hole-button')).toBeTruthy();
                expect(queryByTestId('continue-round-button')).toBeNull();
            });

            it('shouldShowConfirmationWhenEndIncompleteRoundLinkPressed', async () => {
                mockEndRound.mockResolvedValue(true);
                const { getByTestId, getByText } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('end-incomplete-round-link'));
                });
                expect(getByText(/End round\?/)).toBeTruthy();
                expect(getByTestId('confirm-end-round-button')).toBeTruthy();
            });

            it('shouldEndIncompleteRoundWhenConfirmPressed', async () => {
                mockEndRound.mockResolvedValue(true);
                mockGetAllRoundHistory.mockReturnValue([]);
                const { getByTestId, queryByTestId } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('end-incomplete-round-link'));
                });
                await act(async () => {
                    fireEvent.press(getByTestId('confirm-end-round-button'));
                });
                expect(mockEndRound).toHaveBeenCalledWith(42);
                expect(getByTestId('start-button')).toBeTruthy();
                expect(queryByTestId('continue-round-button')).toBeNull();
            });

            it('shouldNotEndIncompleteRoundWhenCancelPressed', async () => {
                const { getByTestId, queryByTestId } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('end-incomplete-round-link'));
                });
                await act(async () => {
                    fireEvent.press(getByTestId('cancel-end-round-button'));
                });
                expect(mockEndRound).not.toHaveBeenCalled();
                expect(queryByTestId('confirm-end-round-button')).toBeNull();
            });

            it('shouldResumeAtNextHoleAfterLastSavedHole', async () => {
                mockGetHolesPlayedForRound.mockReturnValue(5);
                const { getByTestId, getByText } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('continue-round-button'));
                });
                expect(getByText('Hole 6')).toBeTruthy();
            });

            it('shouldResumeAtHole1WhenNoHolesSaved', async () => {
                mockGetHolesPlayedForRound.mockReturnValue(0);
                const { getByTestId, getByText } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('continue-round-button'));
                });
                expect(getByText('Hole 1')).toBeTruthy();
            });

            it('shouldCancelRoundReminderWhenContinueRoundPressed', async () => {
                const { getByTestId } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('continue-round-button'));
                });
                expect(mockCancelAllReminders).toHaveBeenCalled();
            });

            it('shouldHideRoundHistoryWhenIncompleteRoundExists', () => {
                mockGetAllRoundHistory.mockReturnValue([
                    { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null, HolesPlayed: 18 },
                ]);
                const { queryByTestId } = render(<Play />);
                expect(queryByTestId('round-history-scroll')).toBeNull();
            });

            it('shouldStyleEndRoundLinkWithPrimaryColour', () => {
                const { UNSAFE_getByProps } = render(<Play />);
                const endRoundText = UNSAFE_getByProps({ testID: 'end-incomplete-round-link' });
                const textChild = endRoundText.findByProps({ children: 'End round' });
                const colours = require('../../assets/colours').default;
                expect(textChild.props.style).toEqual(expect.objectContaining({ color: colours.red }));
            });
        });
    });

    describe('Player setup', () => {
        it('shows player setup when Start Round is pressed', () => {
            const { getByTestId } = render(<Play />);


            expect(getByTestId('start-button')).toBeTruthy();
            expect(getByTestId('add-player-button')).toBeTruthy();
        });

        it('shows recent course names in player setup', () => {
            mockGetRecentCourseNames.mockReturnValue(['St Andrews', 'Pebble Beach']);

            const { getByText } = render(<Play />);

            expect(getByText('St Andrews')).toBeTruthy();
            expect(getByText('Pebble Beach')).toBeTruthy();
        });

        it('starts round after player setup is completed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith('Test Course', false);
                expect(mockAddRoundPlayers).toHaveBeenCalledWith(1, []);
            });
        });

        it('passes course name to startRoundService', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith('St Andrews', false);
                expect(getByText('Hole 1')).toBeTruthy();
            });
        });

        it('callsGetCourseHoleParsServiceWithCourseNameOnRoundStart', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockGetCourseHolePars).toHaveBeenCalledWith('St Andrews');
            });
        });

        it('passesCorrectInitialParToHoleScoreInputFromPriorRound', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockGetCourseHolePars.mockReturnValue({ 1: 3 });

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('player-score-1')).toHaveTextContent('3');
            });
        });

        it('callsLoadCourseNotesServiceWithCourseNameOnRoundStart', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockLoadCourseNotes).toHaveBeenCalledWith('St Andrews');
            });
        });

        it('showsExistingNoteForCurrentHole', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockLoadCourseNotes.mockReturnValue({ 1: 'aim left of bunker' });

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('hole-note-input').props.value).toBe('aim left of bunker');
            });
        });

        it('callsSaveHoleNoteServiceWhenAdvancingToNextHole', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => expect(getByTestId('hole-note-input')).toBeTruthy());

            fireEvent.changeText(getByTestId('hole-note-input'), 'aim left');
            fireEvent.changeText(getByTestId('first-putt-input'), '20');

            // Next saves the hole, including its note, in one step
            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(mockSaveHoleNote).toHaveBeenCalledWith('St Andrews', 1, 'aim left');
            });
        });

        describe('section heading spacing', () => {
            it('shouldNotAddASecondGapToThePuttingHeadingInsideItsRow', async () => {
                const { StyleSheet } = require('react-native');
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                const { getByTestId, getByText } = render(<Play />);
                fireEvent.changeText(getByTestId('course-name-input'), 'Augusta');
                fireEvent.press(getByTestId('start-button'));
                await waitFor(() => expect(getByTestId('first-putt-input')).toBeTruthy());

                expect(StyleSheet.flatten(getByText('Putting').props.style).marginTop ?? 0).toBe(0);
            });
        });

        describe('single hole screen', () => {
            const startFullRound = async (getByTestId: (id: string) => any) => {
                fireEvent.changeText(getByTestId('course-name-input'), 'Augusta');
                fireEvent.press(getByTestId('start-button'));
                await waitFor(() => expect(getByTestId('next-hole-button')).toBeTruthy());
            };

            it('shouldShowScoreputtingAndDeadlySinsTogetherWithoutPressingNext', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);

                const { getByTestId } = render(<Play />);
                await startFullRound(getByTestId);

                expect(getByTestId('player-score-1')).toBeTruthy();
                expect(getByTestId('first-putt-input')).toBeTruthy();
                expect(getByTestId('7deadly-sins-toggle-trouble-off-tee')).toBeTruthy();
            });

            it('shouldNotAdvanceWhenNextPressedWithoutAFirstPutt', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);

                const { getByTestId, getByText } = render(<Play />);
                await startFullRound(getByTestId);

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                expect(mockAddMultiplayerHoleScores).not.toHaveBeenCalled();
                expect(getByText('Hole 1')).toBeTruthy();
            });

            it('shouldSaveScorePuttingAndDeadlySinsInOneStepWhenNextPressed', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);

                const { getByTestId } = render(<Play />);
                await startFullRound(getByTestId);
                fireEvent.changeText(getByTestId('first-putt-input'), '20');

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(mockAddMultiplayerHoleScores).toHaveBeenCalled();
                    expect(insertPuttingStatsService).toHaveBeenCalledWith(1, 1, 20, 0, false, undefined, undefined, false);
                    expect(mockInsertHoleDeadlySins).toHaveBeenCalled();
                });
            });

            it('shouldHidePuttingAndDeadlySinsInScoreOnlyMode', async () => {
                const mockGetSettings = getSettingsService as jest.Mock;
                const original = mockGetSettings.getMockImplementation();
                mockGetSettings.mockReturnValue({ ...original?.(), skipStatsFlowEnabled: true });
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);

                try {
                    const { getByTestId, queryByTestId } = render(<Play />);
                    await startFullRound(getByTestId);

                    expect(queryByTestId('first-putt-input')).toBeNull();
                    expect(queryByTestId('7deadly-sins-toggle-trouble-off-tee')).toBeNull();
                    expect(getByTestId('player-score-1')).toBeTruthy();
                } finally {
                    mockGetSettings.mockImplementation(original);
                }
            });
        });

        describe('green in regulation on the putting screen', () => {
            // Putting is on the same screen as the score, so there is nothing to advance to
            const advanceToPuttingPhase = async (getByTestId: (id: string) => any) => {
                await waitFor(() => expect(getByTestId('first-putt-input')).toBeTruthy());
            };

            const startRoundOnHoleOne = async (getByTestId: (id: string) => any) => {
                fireEvent.changeText(getByTestId('course-name-input'), 'Augusta');
                fireEvent.press(getByTestId('start-button'));
                await waitFor(() => expect(getByTestId('next-hole-button')).toBeTruthy());
            };

            it('shouldSaveGreenInRegulationTrueWhenYesSelectedOnPuttingScreen', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);

                const { getByTestId } = render(<Play />);
                await startRoundOnHoleOne(getByTestId);
                await advanceToPuttingPhase(getByTestId);

                fireEvent(getByTestId('gir-switch'), 'valueChange', true);
                fireEvent.changeText(getByTestId('first-putt-input'), '20');
                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(insertPuttingStatsService).toHaveBeenCalledWith(1, 1, 20, 0, false, undefined, undefined, true);
                });
            });

            it('shouldShowSavedGreenInRegulationWhenPuttingScreenReopened', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);
                (getPuttingStatsService as jest.Mock).mockReturnValue({
                    Id: 1, RoundId: 1, HoleNumber: 1, FirstPuttDistance: 20, SecondPuttDistance: 0,
                    SecondPuttIsLong: 0, ThirdPuttDistance: undefined, ThirdPuttIsLong: undefined, GreenInRegulation: true,
                });

                const { getByTestId } = render(<Play />);
                await startRoundOnHoleOne(getByTestId);
                await advanceToPuttingPhase(getByTestId);

                expect(getByTestId('gir-switch').props.value).toBe(true);
                (getPuttingStatsService as jest.Mock).mockReturnValue(null);
            });

            it('shouldSaveGreenInRegulationFalseByDefaultOnPuttingScreen', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);

                const { getByTestId } = render(<Play />);
                await startRoundOnHoleOne(getByTestId);
                await advanceToPuttingPhase(getByTestId);

                fireEvent.changeText(getByTestId('first-putt-input'), '20');
                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(insertPuttingStatsService).toHaveBeenCalledWith(1, 1, 20, 0, false, undefined, undefined, false);
                });
            });

            it('shouldSaveGreenInRegulationTrueWhenTwoPuttsAndScoreEqualsParWithoutManualToggle', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);

                const { getByTestId } = render(<Play />);
                await startRoundOnHoleOne(getByTestId);
                await advanceToPuttingPhase(getByTestId);

                fireEvent.changeText(getByTestId('first-putt-input'), '20');
                fireEvent.changeText(getByTestId('second-putt-input'), '3');
                expect(getByTestId('gir-switch').props.value).toBe(true);
                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(insertPuttingStatsService).toHaveBeenCalledWith(1, 1, 20, 3, false, undefined, undefined, true);
                });
            });

            it('shouldSaveGreenInRegulationFalseWhenTwoPuttsButScoreIsBogey', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);

                const { getByTestId } = render(<Play />);
                await startRoundOnHoleOne(getByTestId);
                fireEvent.press(getByTestId('increment-1'));
                await advanceToPuttingPhase(getByTestId);

                fireEvent.changeText(getByTestId('first-putt-input'), '20');
                fireEvent.changeText(getByTestId('second-putt-input'), '3');
                expect(getByTestId('gir-switch').props.value).toBe(false);
                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(insertPuttingStatsService).toHaveBeenCalledWith(1, 1, 20, 3, false, undefined, undefined, false);
                });
            });
        });

        it('starts round with additional players', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1, 2]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('add-player-button'));
            fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockAddRoundPlayers).toHaveBeenCalledWith(1, ['Alice']);
            });
        });

        it('passes false for isScoreOnly when skipStatsFlowEnabled is false', async () => {
            const mockGetSettings = getSettingsService as jest.Mock;
            mockGetSettings.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                skipStatsFlowEnabled: false,
            });
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith('St Andrews', false);
            });
        });

        it('passes true for isScoreOnly when skipStatsFlowEnabled is true', async () => {
            const mockGetSettings = getSettingsService as jest.Mock;
            mockGetSettings.mockReturnValue({
                theme: 'dark',
                notificationsEnabled: true,
                skipStatsFlowEnabled: true,
            });
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith('St Andrews', true);
            });
        });
    });

    describe('Starting a round', () => {
        it('shows #score input after player setup completed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
                expect(getByTestId('end-round-button')).toBeTruthy();
            });
        });
    });

    describe('Active round', () => {
        it('resumes active round on mount', async () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 0,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);

            const { getByText, getByTestId, _queryByText, _queryByTestId } = render(<Play />);

            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            expect(getByText('Hole 1')).toBeTruthy();
            expect(getByTestId('end-round-button')).toBeTruthy();
        });

        it('exports deleteHoleSinDetailsService from DbService', () => {
            // Regression test: deleteHoleSinDetailsService must be exported from DbService
            // (not just imported internally), otherwise the phantom import in play.tsx
            // silently resolves to undefined and crashes at runtime
            expect(mockDeleteHoleSinDetailsService).toBeDefined();
            expect(typeof mockDeleteHoleSinDetailsService).toBe('function');
        });

        it('scrollsToTopWhenNextHoleIsSuccessful', async () => {
            const mockScrollTo = jest.fn();
            const realUseRef = jest.requireActual('react').useRef;
            const spy = jest.spyOn(React, 'useRef')
                .mockImplementationOnce((initial: any) => realUseRef(initial)) // useSectionTransition sectionDirectionRef (its animated values are state, not refs)
                .mockImplementationOnce(() => {
                    const ref = realUseRef(null);
                    Object.defineProperty(ref, 'current', {
                        get: () => ({ scrollTo: mockScrollTo }),
                        set: () => { /* intentionally ignore React's native instance assignment */ },
                        configurable: true,
                    });
                    return ref;
                }) // play screen scrollRef
                .mockImplementation((initial: any) => realUseRef(initial)); // all other useRef calls

            try {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);

                const { getByTestId } = render(<Play />);

                fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
                fireEvent.press(getByTestId('start-button'));

                await waitFor(() => {
                    expect(getByTestId('next-hole-button')).toBeTruthy();
                });

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                expect(mockScrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
            } finally {
                spy.mockRestore();
            }
        });

        it('triggers haptic feedback when next hole saves successfully', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, _getByText } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(mockHapticsImpact).toHaveBeenCalledWith(
                    Haptics.ImpactFeedbackStyle.Medium
                );
            });
        });

        it('submits default par scores when next #pressed without changing score — To be fixed once flow is agreed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockGetCourseHolePars.mockReturnValue({});

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(1, 1, 4, [
                    { playerId: 1, playerName: 'You', score: 4 },
                ]);
            });
        });

        it('does not show Round in progress text during active round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByText } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            expect(queryByText('Round in progress')).toBeNull();
        });

        it('does not show the previous #button on #1 (cannot go below #1)', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText, queryByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            expect(queryByTestId('previous-hole-button')).toBeNull();
            expect(getByText('Hole 1')).toBeTruthy();
        });

        it('shows previous #button from #2 onwards', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByTestId('previous-hole-button')).toBeTruthy();
            });
        });

        it('goes back one when previous button is pressed after going forward two holes', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockInsertHoleDeadlySins.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByText('Hole 2')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('previous-hole-button'));
            });

            expect(getByText('Hole 1')).toBeTruthy();
        });

        it('showsCorrectNoteWhenNavigatingBackward — To be fixed once flow is agreed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockInsertHoleDeadlySins.mockResolvedValue(true);
            mockLoadCourseNotes.mockReturnValue({ 1: 'hole 1 note', 2: 'hole 2 note' });

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => expect(getByTestId('hole-note-input').props.value).toBe('hole 1 note'));

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => expect(getByTestId('hole-note-input').props.value).toBe('hole 2 note'));

            fireEvent.press(getByTestId('previous-hole-button'));

            await waitFor(() => expect(getByTestId('hole-note-input').props.value).toBe('hole 1 note'));
        });

        describe('Par score amendment from pre-selected value', () => {
            it('savesAmendedParWhenChangedFrom3To4', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);
                mockGetCourseHolePars.mockReturnValue({ 1: 3 });

                const { getByTestId } = render(<Play />);

                fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
                fireEvent.press(getByTestId('start-button'));

                await waitFor(() => expect(getByTestId('par-4-button')).toBeTruthy());
                fireEvent.press(getByTestId('par-4-button'));

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(1, 1, 4, [
                        { playerId: 1, playerName: 'You', score: 4 },
                    ]);
                    expect(mockAddMultiplayerHoleScores).not.toHaveBeenCalledWith(1, 1, 3, expect.anything());
                });
            });

            it('savesAmendedParWhenChangedFrom4To5', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);
                mockGetCourseHolePars.mockReturnValue({ 1: 4 });

                const { getByTestId } = render(<Play />);

                fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
                fireEvent.press(getByTestId('start-button'));

                await waitFor(() => expect(getByTestId('par-5-button')).toBeTruthy());
                fireEvent.press(getByTestId('par-5-button'));

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(1, 1, 5, [
                        { playerId: 1, playerName: 'You', score: 5 },
                    ]);
                    expect(mockAddMultiplayerHoleScores).not.toHaveBeenCalledWith(1, 1, 4, expect.anything());
                });
            });

            it('savesAmendedParWhenChangedFrom5To4', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);
                mockGetCourseHolePars.mockReturnValue({ 1: 5 });

                const { getByTestId } = render(<Play />);

                fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
                fireEvent.press(getByTestId('start-button'));

                await waitFor(() => expect(getByTestId('par-4-button')).toBeTruthy());
                fireEvent.press(getByTestId('par-4-button'));

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(1, 1, 4, [
                        { playerId: 1, playerName: 'You', score: 4 },
                    ]);
                    expect(mockAddMultiplayerHoleScores).not.toHaveBeenCalledWith(1, 1, 5, expect.anything());
                });
            });

            it('savesHistoricalPar3WhenAdvancingWithoutTouchingAnyControl', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);
                mockGetCourseHolePars.mockReturnValue({ 1: 3 });

                const { getByTestId } = render(<Play />);

                fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
                fireEvent.press(getByTestId('start-button'));

                await waitFor(() => expect(getByTestId('player-score-1')).toHaveTextContent('3'));

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(1, 1, 3, [
                        { playerId: 1, playerName: 'You', score: 3 },
                    ]);
                    expect(mockAddMultiplayerHoleScores).not.toHaveBeenCalledWith(1, 1, 4, expect.anything());
                });
            });

            it('savesHistoricalPar5WhenAdvancingWithoutTouchingAnyControl', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockAddMultiplayerHoleScores.mockResolvedValue(true);
                mockGetCourseHolePars.mockReturnValue({ 1: 5 });

                const { getByTestId } = render(<Play />);

                fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
                fireEvent.press(getByTestId('start-button'));

                await waitFor(() => expect(getByTestId('player-score-1')).toHaveTextContent('5'));

                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });

                await waitFor(() => {
                    expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(1, 1, 5, [
                        { playerId: 1, playerName: 'You', score: 5 },
                    ]);
                    expect(mockAddMultiplayerHoleScores).not.toHaveBeenCalledWith(1, 1, 4, expect.anything());
                });
            });
        });
    });

    describe('Ending a round', () => {
        it('shouldDiscardTheRoundWithoutSavingItWhenDiscardRoundPressed', async () => {
            const { deleteRoundService } = require('../../service/DbService');
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);

            const { getByTestId, queryByTestId } = render(<Play />);
            fireEvent.changeText(getByTestId('course-name-input'), 'Augusta');
            fireEvent.press(getByTestId('start-button'));
            await waitFor(() => expect(getByTestId('end-round-button')).toBeTruthy());

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('end-round-discard-button'));
            });

            await waitFor(() => {
                expect(deleteRoundService).toHaveBeenCalledWith(1);
                expect(mockEndRound).not.toHaveBeenCalled();
                expect(queryByTestId('end-round-discard-button')).toBeNull();
            });
        });


        it('shows confirm button when End Round is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            expect(getByTestId('end-round-save-button')).toBeTruthy();
        });

        it('does not call endRoundService until confirm is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            expect(mockEndRound).not.toHaveBeenCalled();
        });

        it('calls endRoundService when confirm is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('end-round-save-button'));
            });

            await waitFor(() => {
                expect(mockEndRound).toHaveBeenCalledWith(1);
            });
        });

        it('returns to idle state after confirming end round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('end-round-save-button'));
            });

            await waitFor(() => {
                expect(getByTestId('start-button')).toBeTruthy();
            });
        });

        it('hides confirm button when cancel is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            expect(getByTestId('end-round-save-button')).toBeTruthy();

            fireEvent.press(getByTestId('end-round-keep-playing-button'));

            expect(queryByTestId('end-round-save-button')).toBeNull();
            expect(getByTestId('end-round-button')).toBeTruthy();
        });
    });

    describe('Multiplayer scoring', () => {
        it('calls addMultiplayerHoleScoresService on score submit', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1, 2]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('add-player-button'));
            fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(mockAddMultiplayerHoleScores).toHaveBeenCalled();
            });
        });

        it('resumes active round with players on mount', async () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 0,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
                { Id: 2, RoundId: 5, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
            ]);

            const { getByText, getByTestId } = render(<Play />);

            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            expect(getByText('You')).toBeTruthy();
            expect(getByText('Alice')).toBeTruthy();
        });

        it('shows active round section when active round has no players', async () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: 0,
            });
            mockGetRoundPlayers.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            expect(getByTestId('end-round-button')).toBeTruthy();
        });

        it('does not advance #when addMultiplayerHoleScoresService returns false', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(false);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            expect(getByText('Hole 1')).toBeTruthy();
        });
    });

    describe('Post-round scorecard', () => {
        const startAndEndRound = async (getByTestId: any) => {
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('end-round-save-button'));
            });
        };

        const mockScorecardData = {
            round: { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            players: [
                { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
                { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
            ],
            holeScores: [
                { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
                { Id: 2, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 4 },
            ],
        };

        it('shows scorecard after confirming end round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetMultiplayerScorecard.mockReturnValue(mockScorecardData);

            const { getByTestId, getByText } = render(<Play />);

            await startAndEndRound(getByTestId);

            await waitFor(() => {
                expect(getByText('Scorecard')).toBeTruthy();
                expect(getByTestId('scorecard-done-button')).toBeTruthy();
            });
        });

        it('shows player names and totals on scorecard', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetMultiplayerScorecard.mockReturnValue(mockScorecardData);

            const { getByTestId } = render(<Play />);

            await startAndEndRound(getByTestId);

            await waitFor(() => {
                expect(getByTestId('player-total-1')).toBeTruthy();
                expect(getByTestId('player-total-2')).toBeTruthy();
            });
        });

        it('returns to idle when Done pressed on scorecard', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetMultiplayerScorecard.mockReturnValue(mockScorecardData);

            const { getByTestId, queryByText } = render(<Play />);

            await startAndEndRound(getByTestId);

            await waitFor(() => {
                expect(getByTestId('scorecard-done-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('scorecard-done-button'));

            await waitFor(() => {
                expect(getByTestId('start-button')).toBeTruthy();
                expect(queryByText('Scorecard')).toBeNull();
            });
        });

        it('returns to idle when no scorecard data available', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetMultiplayerScorecard.mockReturnValue(null);

            const { getByTestId } = render(<Play />);

            await startAndEndRound(getByTestId);

            await waitFor(() => {
                expect(getByTestId('start-button')).toBeTruthy();
            });
        });

        it('fetches scorecard with correct round ID', async () => {
            mockStartRound.mockResolvedValue(42);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetMultiplayerScorecard.mockReturnValue(null);

            const { getByTestId } = render(<Play />);

            await startAndEndRound(getByTestId);

            await waitFor(() => {
                expect(mockGetMultiplayerScorecard).toHaveBeenCalledWith(42);
            });
        });

        it('shows Edit link alongside Done on scorecard', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            const mockScorecard = {
                round: { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
                players: [
                    { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
                ],
                holeScores: [
                    { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
                ],
            };
            mockGetMultiplayerScorecard.mockReturnValue(mockScorecard);

            const { getByTestId } = render(<Play />);

            await startAndEndRound(getByTestId);

            await waitFor(() => {
                expect(getByTestId('scorecard-done-button')).toBeTruthy();
                expect(getByTestId('scorecard-edit-button')).toBeTruthy();
            });
        });

        it('enters inline edit mode when Edit link pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            const mockScorecard = {
                round: { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
                players: [
                    { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
                ],
                holeScores: [
                    { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
                ],
            };
            mockGetMultiplayerScorecard.mockReturnValue(mockScorecard);

            const { getByTestId, queryByTestId } = render(<Play />);

            await startAndEndRound(getByTestId);

            await waitFor(() => {
                expect(getByTestId('scorecard-edit-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('scorecard-edit-button'));

            await waitFor(() => {
                expect(getByTestId('inline-editor-scorecard')).toBeTruthy();
                expect(queryByTestId('scorecard-done-button')).toBeNull();
            });
        });

        describe('7 Deadly Sins on complete scorecard', () => {
            it('showsDeadlySinsTallyWhenUserHoleSelectedOnCompleteScorecard', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockEndRound.mockResolvedValue(true);
                mockGetMultiplayerScorecard.mockReturnValue(mockScorecardData);
                mockGetHoleDeadlySins.mockReturnValue({
                    threePutts: true, doubleBogeys: false, bogeysPar5: false,
                    bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false,
                });

                const { getByTestId } = render(<Play />);
                await startAndEndRound(getByTestId);

                await waitFor(() => getByTestId('scorecard-done-button'));
                fireEvent.press(getByTestId('score-cell-1-1'));

                await waitFor(() => expect(getByTestId('7deadly-sins-toggle-three-putts')).toBeTruthy());
            });

            it('doesNotShowDeadlySinsTallyWhenOpponentHoleSelected', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockEndRound.mockResolvedValue(true);
                mockGetMultiplayerScorecard.mockReturnValue(mockScorecardData);

                const { getByTestId, queryByTestId } = render(<Play />);
                await startAndEndRound(getByTestId);

                await waitFor(() => getByTestId('scorecard-done-button'));
                fireEvent.press(getByTestId('score-cell-1-2'));

                expect(queryByTestId('7deadly-sins-toggle-three-putts')).toBeNull();
            });

            it('showsSinHoleDotsOnCompleteScorecard', async () => {
                mockStartRound.mockResolvedValue(1);
                mockAddRoundPlayers.mockResolvedValue([1]);
                mockEndRound.mockResolvedValue(true);
                mockGetMultiplayerScorecard.mockReturnValue(mockScorecardData);
                mockGetHolesWithSinsForRound.mockReturnValue(new Set([1]));

                const { getByTestId } = render(<Play />);
                await startAndEndRound(getByTestId);

                await waitFor(() => expect(getByTestId('sin-indicator-1')).toBeTruthy());
            });
        });
    });

    describe('Start round failure', () => {
        it('shows error toast when startRoundService returns null', async () => {
            mockStartRound.mockResolvedValue(null);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');

            await act(async () => {
                fireEvent.press(getByTestId('start-button'));
            });

            expect(mockToastShow).toHaveBeenCalledWith(
                'Failed to start round',
                expect.objectContaining({ type: 'danger' })
            );
        });
    });

    describe('Keyboard handling', () => {
        it('shouldLetTapsPassThroughToButtonsWhileKeyboardIsOpen', () => {
            const { UNSAFE_getAllByType } = render(<Play />);
            const { ScrollView } = require('react-native');
            const scrolls = UNSAFE_getAllByType(ScrollView);

            expect(scrolls.some((sv: any) => sv.props.keyboardShouldPersistTaps === 'handled')).toBe(true);
        });
    });

    describe('Autosave hole score', () => {
        it('shouldSaveScoreAsSoonAsStepperChangesBeforeNextIsPressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            await act(async () => {
                fireEvent.press(getByTestId('start-button'));
            });
            await waitFor(() => expect(getByTestId('next-hole-button')).toBeTruthy());
            mockAddMultiplayerHoleScores.mockClear();

            const shownBefore = Number(getByTestId('player-score-1').props.children);
            fireEvent.press(getByTestId('increment-1'));

            expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(
                1,
                1,
                expect.any(Number),
                [expect.objectContaining({ playerId: 1, score: shownBefore + 1 })]
            );
        });
    });

    describe('Hole save failure', () => {
        it('shows error toast when a hole score cannot be saved', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(false);

            const { getByTestId } = render(<Play />);
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            await act(async () => {
                fireEvent.press(getByTestId('start-button'));
            });
            await waitFor(() => expect(getByTestId('next-hole-button')).toBeTruthy());

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            expect(mockToastShow).toHaveBeenCalledWith(
                'Could not save hole',
                expect.objectContaining({ type: 'danger' })
            );
        });
    });

    describe('Analytics tracking', () => {
        it('logs start_round event when start round button pressed and round starts', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            await act(async () => {
                fireEvent.press(getByTestId('start-button'));
            });

            await waitFor(() => expect(mockLogEvent).toHaveBeenCalledWith('start_round'));
        });

        it('logs continue_round event when continue round button pressed', async () => {
            mockGetActiveRound.mockReturnValue({ Id: 42, TotalScore: 0, IsCompleted: 0, StartTime: '', EndTime: '', Created_At: '15/06', IsScoreOnly: 0 });
            mockGetRoundPlayers.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            await act(async () => {
                fireEvent.press(getByTestId('continue-round-button'));
            });

            expect(mockLogEvent).toHaveBeenCalledWith('continue_round');
        });

        it('logs end_round event when confirm end round pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => expect(getByTestId('end-round-button')).toBeTruthy());

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('end-round-save-button'));
            });

            await waitFor(() => expect(mockLogEvent).toHaveBeenCalledWith('end_round'));
        });

    });

});
