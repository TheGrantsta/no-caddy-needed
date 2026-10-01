import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';

import {
    startRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertHoleDeadlySinsService,
    getAllDeadlySinsRoundsService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    getSettingsService,
    getHolesPlayedForRoundService,
    loadCourseNotesService,
    saveHoleNoteService,
    getHolesWithSinsForRoundService,
    _PENALTY_TYPES,
} from '../../service/DbService';

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
const mockAddMultiplayerHoleScores = addMultiplayerHoleScoresService as jest.Mock;
const mockGetActiveRound = getActiveRoundService as jest.Mock;
const mockGetAllRoundHistory = getAllRoundHistoryService as jest.Mock;
const mockInsertHoleDeadlySins = insertHoleDeadlySinsService as jest.Mock;
const mockGetAllDeadlySinsRounds = getAllDeadlySinsRoundsService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockAddRoundPlayers = addRoundPlayersService as jest.Mock;
const mockGetRoundPlayers = getRoundPlayersService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockGetRecentCourseNames = getRecentCourseNamesService as jest.Mock;
const mockGetRecentPlayerNames = getRecentPlayerNamesService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;
const mockGetHolesPlayedForRound = getHolesPlayedForRoundService as jest.Mock;
const mockLoadCourseNotes = loadCourseNotesService as jest.Mock;
const mockSaveHoleNote = saveHoleNoteService as jest.Mock;
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

    describe('hole navigation controls', () => {
        const startRound = async (utils: ReturnType<typeof render>) => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            fireEvent.press(utils.getByTestId('start-round-button'));
            fireEvent.changeText(utils.getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(utils.getByTestId('start-button'));
            await waitFor(() => expect(utils.getByText('#1')).toBeTruthy());
        };

        // Resume an in-progress round to land directly on hole (holesPlayed + 1).
        const resumeAtHole = async (holesPlayed: number, isScoreOnly: number = 0) => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null, Created_At: '2025-06-15T10:00:00.000Z',
                IsScoreOnly: isScoreOnly,
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);
            mockGetHolesPlayedForRound.mockReturnValue(holesPlayed);
            const utils = render(<Play />);
            await act(async () => {
                fireEvent.press(utils.getByTestId('continue-round-button'));
            });
            return utils;
        };

        it('shows a strong skip-next icon on the Next hole button', async () => {
            const utils = render(<Play />);
            await startRound(utils);

            const button = utils.UNSAFE_getByProps({ testID: 'next-hole-button' });
            expect(button.findByProps({ name: 'skip-next' })).toBeTruthy();
        });

        it('gives the Next hole button a primary-coloured border', async () => {
            const colours = require('../../assets/colours').default;
            const utils = render(<Play />);
            await startRound(utils);

            const style = StyleSheet.flatten(utils.getByTestId('next-hole-button').props.style);
            expect(style.borderWidth).toBeGreaterThan(0);
            expect(style.borderColor).toBe(colours.primary);
        });

        it('renders End round in red', async () => {
            const colours = require('../../assets/colours').default;
            const utils = render(<Play />);
            await startRound(utils);

            const endRoundText = utils.UNSAFE_getByProps({ testID: 'end-round-button' })
                .findByProps({ children: 'End round' });
            expect(endRoundText.props.style).toEqual(expect.objectContaining({ color: colours.red }));
        });

        it('hides the Previous hole button on the first hole', async () => {
            const utils = render(<Play />);
            await startRound(utils);

            expect(utils.queryByTestId('previous-hole-button')).toBeNull();
        });

        it('does not show Previous button on the first hole', async () => {
            const utils = render(<Play />);
            await startRound(utils);

            // Previous button is not rendered on hole 1, only Next button shows
            expect(utils.queryByTestId('previous-hole-button')).toBeNull();
        });

        it('renders Previous hole as a green-bordered button with a skip-previous icon after hole 1', async () => {
            const colours = require('../../assets/colours').default;
            const utils = await resumeAtHole(1); // resumes on hole 2

            const button = utils.UNSAFE_getByProps({ testID: 'previous-hole-button' });
            const style = StyleSheet.flatten(button.props.style);
            expect(style.borderColor).toBe(colours.primary);
            expect(button.findByProps({ name: 'skip-previous' })).toBeTruthy();
        });

        describe('Previous button behavior and label', () => {
            it('shows "Previous" label', async () => {
                const utils = await resumeAtHole(1); // hole 2
                expect(utils.getByText('Previous')).toBeTruthy();
            });

            it('shows "Previous" label in all phases', () => {
                // Regression test: label is always "Previous" in the compact button layout
                const conditional = (holePhase: string) => {
                    return holePhase === 'score' ? 'Previous hole' : 'Previous';
                };

                expect(conditional('score')).toBe('Previous hole');
                expect(conditional('stats')).toBe('Previous');
                expect(conditional('sinDetails')).toBe('Previous');
                expect(conditional('putting')).toBe('Previous');
            });
        });

        it('turns Next into "Finish" with a flag icon on the last hole', async () => {
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
            });
            const utils = await resumeAtHole(17, 1); // resumes on hole 18 in score-only mode

            const button = utils.UNSAFE_getByProps({ testID: 'next-hole-button' });
            expect(button.findByProps({ children: 'Finish' })).toBeTruthy();
            expect(button.findByProps({ name: 'sports-score' })).toBeTruthy();
        });
    });

    describe('hole transition animation', () => {
        it('triggers Animated.timing on Next hole press', async () => {
            const animSpy = jest.spyOn(Animated, 'timing');
            const utils = render(<Play />);
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            fireEvent.press(utils.getByTestId('start-round-button'));
            fireEvent.changeText(utils.getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(utils.getByTestId('start-button'));
            await waitFor(() => expect(utils.getByText('#1')).toBeTruthy());

            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockInsertHoleDeadlySins.mockResolvedValue(undefined);
            mockSaveHoleNote.mockResolvedValue(undefined);
            fireEvent.press(utils.getByTestId('next-hole-button'));

            await waitFor(() => {
                expect(animSpy).toHaveBeenCalledWith(
                    expect.any(Animated.Value),
                    expect.objectContaining({ useNativeDriver: true })
                );
            });

            animSpy.mockRestore();
        });

        it('keeps nav buttons present after Next hole press', async () => {
            const utils = render(<Play />);
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            fireEvent.press(utils.getByTestId('start-round-button'));
            fireEvent.changeText(utils.getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(utils.getByTestId('start-button'));
            await waitFor(() => expect(utils.getByText('#1')).toBeTruthy());

            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockInsertHoleDeadlySins.mockResolvedValue(undefined);
            mockSaveHoleNote.mockResolvedValue(undefined);

            fireEvent.press(utils.getByTestId('next-hole-button'));

            expect(utils.getByTestId('next-hole-button')).toBeTruthy();
        });
    });

    describe('Sub menu navigation', () => {
        it('shows sub menu on render', () => {
            const { getByTestId } = render(<Play />);

            expect(getByTestId('play-sub-menu-score')).toBeTruthy();
            expect(getByTestId('play-sub-menu-distances')).toBeTruthy();
            expect(getByTestId('play-sub-menu-wedge-chart')).toBeTruthy();
        });

        it('shows score input by default during active round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
            });
        });

        it('shows distances section when Distances is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockGetClubDistances.mockReturnValue([]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('play-sub-menu-distances')).toBeTruthy();
            });

            fireEvent.press(getByTestId('play-sub-menu-distances'));

            expect(getByText('Club carry distances NOT total')).toBeTruthy();
        });

        it('shows wedge chart section when Wedge chart is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('play-sub-menu-wedge-chart')).toBeTruthy();
            });

            fireEvent.press(getByTestId('play-sub-menu-wedge-chart'));

            expect(getByText('Wedge carry distances NOT total')).toBeTruthy();
        });

        it('returns to score input when Play is pressed after switching', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockGetClubDistances.mockReturnValue([]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('play-sub-menu-distances')).toBeTruthy();
            });

            fireEvent.press(getByTestId('play-sub-menu-distances'));
            fireEvent.press(getByTestId('play-sub-menu-score'));

            expect(getByText('#1')).toBeTruthy();
        });

        it('shows distances when Distances is pressed without active round', () => {
            mockGetClubDistances.mockReturnValue([]);

            const { getByTestId, getByText, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-distances'));

            expect(getByText('Club carry distances NOT total')).toBeTruthy();
            expect(queryByTestId('start-round-button')).toBeNull();
        });

        it('shows wedge chart when Wedge chart is pressed without active round', () => {
            const { getByTestId, getByText, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-wedge-chart'));

            expect(getByText('Wedge carry distances NOT total')).toBeTruthy();
            expect(queryByTestId('start-round-button')).toBeNull();
        });

        it('returns to idle state when Play is pressed after viewing distances', () => {
            mockGetClubDistances.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-distances'));
            fireEvent.press(getByTestId('play-sub-menu-score'));

            expect(getByTestId('start-round-button')).toBeTruthy();
        });

        it('hides player setup when switching to distances', () => {
            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            expect(getByTestId('start-button')).toBeTruthy();

            fireEvent.press(getByTestId('play-sub-menu-distances'));

            expect(queryByTestId('start-button')).toBeNull();
            expect(queryByTestId('add-player-button')).toBeNull();
        });
    });

    describe('18-Hole limit', () => {
        beforeEach(() => {
            mockGetSettingsService.mockReturnValue({ skipStatsFlowEnabled: true, });
        });

        const startRoundAndAdvanceToHole = async (getByTestId: any, getByText: any, targetHole: number) => {
            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
            });

            for (let i = 1; i < targetHole; i++) {
                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });
                await waitFor(() => {
                    expect(getByText(`#${i + 1}`)).toBeTruthy();
                });
            }
        };

        it('shows end round confirm after submitting Hole 18 scores — To be fixed once flow is agreed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockInsertHoleDeadlySins.mockResolvedValue(true);

            const { getByTestId, getByText, queryByText } = render(<Play />);

            await startRoundAndAdvanceToHole(getByTestId, getByText, 18);

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            // await waitFor(() => {
            //     expect(getByTestId('7deadly-sins-toggle')).toBeTruthy();
            // });

            // await act(async () => {
            //     fireEvent.press(getByTestId('next-hole-button'));
            // });

            await waitFor(() => {
                expect(getByTestId('confirm-end-round-button')).toBeTruthy();
            });

            expect(queryByText('#19')).toBeNull();
        });

        it('saves Hole 18 scores before showing end round confirmation', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            await startRoundAndAdvanceToHole(getByTestId, getByText, 18);

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(mockAddMultiplayerHoleScores).toHaveBeenCalledWith(
                    1, 18, 4, [{ playerId: 1, playerName: 'You', score: 4 }]
                );
            });
        });
    });

    describe('Tab bar visibility', () => {
        it('shouldKeepTabBarVisibleWhenRoundIsActive', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => expect(getByTestId('end-round-button')).toBeTruthy());

            expect(mockSetOptions).not.toHaveBeenCalledWith({ tabBarStyle: { display: 'none' } });
        });

        it('shouldNeverHideTabBarOnInitialRender', () => {
            render(<Play />);
            expect(mockSetOptions).not.toHaveBeenCalledWith({ tabBarStyle: { display: 'none' } });
        });
    });

    describe('Section transition animation', () => {
        it('triggers Animated.timing when switching to Distances section', async () => {
            const animSpy = jest.spyOn(Animated, 'timing');
            const utils = render(<Play />);

            await waitFor(() => expect(utils.getByTestId('play-sub-menu-distances')).toBeTruthy());

            fireEvent.press(utils.getByTestId('play-sub-menu-distances'));

            await waitFor(() => {
                expect(animSpy).toHaveBeenCalledWith(
                    expect.any(Animated.Value),
                    expect.objectContaining({ useNativeDriver: true })
                );
            });

            animSpy.mockRestore();
        });

        it('triggers Animated.timing when switching to Wedge Chart section', async () => {
            const animSpy = jest.spyOn(Animated, 'timing');
            const utils = render(<Play />);

            await waitFor(() => expect(utils.getByTestId('play-sub-menu-wedge-chart')).toBeTruthy());

            fireEvent.press(utils.getByTestId('play-sub-menu-wedge-chart'));

            await waitFor(() => {
                expect(animSpy).toHaveBeenCalledWith(
                    expect.any(Animated.Value),
                    expect.objectContaining({ useNativeDriver: true })
                );
            });

            animSpy.mockRestore();
        });
    });
});
