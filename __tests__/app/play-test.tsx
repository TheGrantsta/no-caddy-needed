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
    insertDeadlySinsRoundService,
    getAllDeadlySinsRoundsService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    getSettingsService,
    saveSettingsService,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder } from '../../service/NotificationService';

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
    insertDeadlySinsRoundService: jest.fn(),
    getAllDeadlySinsRoundsService: jest.fn(),
    getClubDistancesService: jest.fn(),
    getWedgeChartService: jest.fn().mockReturnValue({ distanceNames: [], clubs: [] }),
    saveWedgeChartService: jest.fn(),
    addRoundPlayersService: jest.fn(),
    getRoundPlayersService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    getRecentCourseNamesService: jest.fn(),
    getRecentPlayerNamesService: jest.fn(),
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
        homeOnboardingSeen: true,
        practiceOnboardingSeen: true,
    }),
    saveSettingsService: jest.fn().mockResolvedValue(true),
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
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        useRouter: () => ({
            push: mockPush,
        }),
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <View testID={`link-${href}`}>{children}</View>
        ),
    };
});

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
const mockInsertDeadlySinsRound = insertDeadlySinsRoundService as jest.Mock;
const mockGetAllDeadlySinsRounds = getAllDeadlySinsRoundsService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockScheduleReminder = scheduleRoundReminder as jest.Mock;
const mockCancelReminder = cancelRoundReminder as jest.Mock;
const mockAddRoundPlayers = addRoundPlayersService as jest.Mock;
const mockGetRoundPlayers = getRoundPlayersService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockGetRecentCourseNames = getRecentCourseNamesService as jest.Mock;
const mockGetRecentPlayerNames = getRecentPlayerNamesService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

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
    });

    describe('Idle state', () => {
        it('shows Start Round button when no active round', () => {
            const { getByTestId } = render(<Play />);

            expect(getByTestId('start-round-button')).toBeTruthy();
        });

        it('shows round history when rounds exist', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('Round history')).toBeTruthy();
            expect(getByText('15/06')).toBeTruthy();
            expect(getByText('+3')).toBeTruthy();
        });

        it('shows even par as E in round history', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 0, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('E')).toBeTruthy();
        });

        it('shows negative score in round history', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: -2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('-2')).toBeTruthy();
        });

        it('All filter shows all rounds', () => {
            const rounds = Array.from({ length: 35 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('round-history-row-35')).toBeTruthy();
        });

        it('renders round history in a scrollable container', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('round-history-scroll')).toBeTruthy();
        });

        it('renders date column at 70% width and score and 7 Deadly Sins columns at 15% width', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null },
            ]);

            const { getByTestId } = render(<Play />);

            const dateHeader = getByTestId('round-history-header-date');
            const scoreHeader = getByTestId('round-history-header-score');
            const t5Header = getByTestId('round-history-header-7DS');

            expect(dateHeader.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ width: '70%' })]));
            expect(scoreHeader.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ width: '15%' })]));
            expect(t5Header.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ width: '15%' })]));
        });

        it('renders round history rows as tappable', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('round-history-row-1')).toBeTruthy();
        });

        it('navigates to scorecard when round history row is pressed', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null },
            ]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('round-history-row-1'));

            expect(mockPush).toHaveBeenCalledWith({ pathname: '/play/scorecard', params: { roundId: '1' } });
        });

        it('shows course name in round history when set', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: 'St Andrews' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('15/06 - St Andrews')).toBeTruthy();
        });

        it('does not show course name text when CourseName is null', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null },
            ]);

            const { queryByTestId } = render(<Play />);

            expect(queryByTestId('round-history-course-1')).toBeNull();
        });

        it('shows holes played in history row when less than 18', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null, HolesPlayed: 9 },
            ]);

            const { queryByText } = render(<Play />);

            expect(queryByText(/9/)).toBeTruthy();
        });

        it('does not show holes played in history row when 18 holes', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null, HolesPlayed: 18 },
            ]);

            const { queryByText } = render(<Play />);

            expect(queryByText(/18 holes/)).toBeNull();
        });

        it('shows holes played alongside course name when less than 18', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: 'St Andrews', HolesPlayed: 9 },
            ]);

            const { queryByText } = render(<Play />);

            expect(queryByText(/St Andrews.*9/)).toBeTruthy();
        });

        describe('Incomplete round on mount', () => {
            const incompleteRound = { Id: 42, TotalScore: 0, IsCompleted: 0, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: 'Pebble Beach', HolesPlayed: 5 };

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
                expect(queryByTestId('start-round-button')).toBeNull();
            });

            it('shouldResumeRoundWhenContinuePressed', async () => {
                const { getByTestId, queryByTestId } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('continue-round-button'));
                });
                expect(getByTestId('next-hole-button')).toBeTruthy();
                expect(queryByTestId('continue-round-button')).toBeNull();
            });

            it('shouldEndIncompleteRoundWhenEndRoundLinkPressed', async () => {
                mockEndRound.mockResolvedValue(true);
                mockGetAllRoundHistory.mockReturnValue([]);
                const { getByTestId, queryByTestId } = render(<Play />);
                await act(async () => {
                    fireEvent.press(getByTestId('end-incomplete-round-link'));
                });
                expect(mockEndRound).toHaveBeenCalledWith(42);
                expect(getByTestId('start-round-button')).toBeTruthy();
                expect(queryByTestId('continue-round-button')).toBeNull();
            });
        });
    });

    describe('History filter', () => {
        it('renders filter buttons 1, 10, and All when round history exists', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01' },
            ]);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('filter-button-1')).toBeTruthy();
            expect(getByTestId('filter-button-10')).toBeTruthy();
            expect(getByTestId('filter-button-all')).toBeTruthy();
        });

        it('renders Filter label next to the filter buttons', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01' },
            ]);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('filter-label')).toBeTruthy();
        });

        it('all filter buttons have the same fixed width', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01' },
            ]);

            const { getByTestId } = render(<Play />);

            const btn1 = getByTestId('filter-button-1');
            const btn10 = getByTestId('filter-button-10');
            const btnAll = getByTestId('filter-button-all');

            const getWidth = (el: any) => {
                const styles = Array.isArray(el.props.style) ? el.props.style : [el.props.style];
                return styles.find((s: any) => s && s.width !== undefined)?.width;
            };

            expect(getWidth(btn1)).toBeDefined();
            expect(getWidth(btn1)).toEqual(getWidth(btn10));
            expect(getWidth(btn1)).toEqual(getWidth(btnAll));
        });

        it('shows all rounds by default', () => {
            const rounds = Array.from({ length: 5 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId } = render(<Play />);

            rounds.forEach(r => expect(getByTestId(`round-history-row-${r.Id}`)).toBeTruthy());
        });

        it('limits round history to 1 when filter 1 is pressed', () => {
            const rounds = Array.from({ length: 3 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('filter-button-1'));

            expect(getByTestId('round-history-row-1')).toBeTruthy();
            expect(queryByTestId('round-history-row-2')).toBeNull();
            expect(queryByTestId('round-history-row-3')).toBeNull();
        });

        it('limits round history to 10 when filter 10 is pressed', () => {
            const rounds = Array.from({ length: 12 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('filter-button-10'));

            expect(getByTestId('round-history-row-10')).toBeTruthy();
            expect(queryByTestId('round-history-row-11')).toBeNull();
            expect(queryByTestId('round-history-row-12')).toBeNull();
        });

        it('shows all rounds again when All pressed after filtering', () => {
            const rounds = Array.from({ length: 3 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('filter-button-1'));
            fireEvent.press(getByTestId('filter-button-all'));

            rounds.forEach(r => expect(getByTestId(`round-history-row-${r.Id}`)).toBeTruthy());
        });
    });

    describe('Player setup', () => {
        it('shows player setup when Start Round is pressed', () => {
            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            expect(getByTestId('start-button')).toBeTruthy();
            expect(getByTestId('add-player-button')).toBeTruthy();
        });

        it('shows recent course names in player setup', () => {
            mockGetRecentCourseNames.mockReturnValue(['St Andrews', 'Pebble Beach']);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            expect(getByText('St Andrews')).toBeTruthy();
            expect(getByText('Pebble Beach')).toBeTruthy();
        });

        it('shows recent player names in player setup', () => {
            mockGetRecentPlayerNames.mockReturnValue(['Alice', 'Bob']);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            expect(getByTestId('recent-player-Alice')).toBeTruthy();
            expect(getByTestId('recent-player-Bob')).toBeTruthy();
        });

        it('returns to idle state when cancel is pressed in player setup', () => {
            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            expect(getByTestId('start-button')).toBeTruthy();
            expect(getByTestId('cancel-button')).toBeTruthy();

            fireEvent.press(getByTestId('cancel-button'));

            expect(getByTestId('start-round-button')).toBeTruthy();
            expect(queryByTestId('start-button')).toBeNull();
            expect(queryByTestId('cancel-button')).toBeNull();
        });

        it('starts round after player setup is completed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith('Test Course');
                expect(mockAddRoundPlayers).toHaveBeenCalledWith(1, []);
            });
        });

        it('passes course name to startRoundService', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'St Andrews');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith('St Andrews');
                expect(getByText('#1')).toBeTruthy();
            });
        });

        it('starts round with additional players', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1, 2]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('add-player-button'));
            fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockAddRoundPlayers).toHaveBeenCalledWith(1, ['Alice']);
            });
        });
    });

    describe('Starting a round', () => {
        it('shows #score input after player setup completed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
                expect(getByTestId('end-round-button')).toBeTruthy();
            });
        });
    });

    describe('Active round', () => {
        it('resumes active round on mount', () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);

            const { getByText, getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('continue-round-button'));

            expect(getByText(/#/)).toBeTruthy();
            expect(getByTestId('end-round-button')).toBeTruthy();
        });

        it('advances to next #after scoring', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByText('#2')).toBeTruthy();
            });
        });

        it('submits default par scores when next #pressed without changing score', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
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

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            expect(queryByText('Round in progress')).toBeNull();
        });

        it('pressing previous #button on #1 does not navigate below #1', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
            });

            fireEvent.press(getByTestId('previous-hole-button'));

            expect(getByText('#1')).toBeTruthy();
        });

        it('shows previous #button from #2 onwards', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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

        it('goes back one #when previous #is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByText('#2')).toBeTruthy();
            });

            fireEvent.press(getByTestId('previous-hole-button'));

            expect(getByText('#1')).toBeTruthy();
        });
    });

    describe('Ending a round', () => {
        it('shows confirm button when End Round is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            expect(getByTestId('confirm-end-round-button')).toBeTruthy();
        });

        it('does not call endRoundService until confirm is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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
                expect(mockEndRound).toHaveBeenCalledWith(1);
            });
        });

        it('returns to idle state after confirming end round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
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
                expect(getByTestId('start-round-button')).toBeTruthy();
            });
        });

        it('hides confirm button when cancel is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            expect(getByTestId('confirm-end-round-button')).toBeTruthy();

            fireEvent.press(getByTestId('cancel-end-round-button'));

            expect(queryByTestId('confirm-end-round-button')).toBeNull();
            expect(getByTestId('end-round-button')).toBeTruthy();
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

            expect(getByText('Club carry distances NOT total distances to choose the right club')).toBeTruthy();
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

            expect(getByText('Your wedge carry distances NOT total distances to choose the right club')).toBeTruthy();
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

            expect(getByText('Club carry distances NOT total distances to choose the right club')).toBeTruthy();
            expect(queryByTestId('start-round-button')).toBeNull();
        });

        it('shows wedge chart when Wedge chart is pressed without active round', () => {
            const { getByTestId, getByText, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-wedge-chart'));

            expect(getByText('Your wedge carry distances NOT total distances to choose the right club')).toBeTruthy();
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

    describe('7 Deadly Sins integration', () => {
        it('shows 7 Deadly Sins tally when round starts', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText, queryByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
            expect(getByText('Double chips')).toBeTruthy();
            expect(getByText('Trouble off tee')).toBeTruthy();
            expect(getByText('Penalties')).toBeTruthy();
            expect(queryByText('Double bogeys')).toBeNull();
            expect(queryByText('Bogeys on par 5s')).toBeNull();
        });

        it('does not show Score/7 Deadly Sins toggle buttons', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            expect(queryByTestId('toggle-score')).toBeNull();
            expect(queryByTestId('toggle-7deadly-sins')).toBeNull();
        });

        it('saves Deadly Sins when round ends above par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockEndRound.mockResolvedValue(true);
            mockInsertDeadlySinsRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            // Increment score to be above par, then submit
            fireEvent.press(getByTestId('increment-1'));
            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('confirm-end-round-button'));
            });

            await waitFor(() => {
                expect(mockInsertDeadlySinsRound).toHaveBeenCalledWith(
                    1, expect.any(Number), expect.any(Number), expect.any(Number),
                    expect.any(Number), expect.any(Number), expect.any(Number), expect.any(Number)
                );
            });
        });

        it('saves troubleOffTee and penalties values when round ends above par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockEndRound.mockResolvedValue(true);
            mockInsertDeadlySinsRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            // Increment trouble-off-tee and penalties
            fireEvent.press(getByTestId('7deadly-sins-increment-trouble-off-tee'));
            fireEvent.press(getByTestId('7deadly-sins-increment-penalties'));

            // Increment score to be above par, then submit
            fireEvent.press(getByTestId('increment-1'));
            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('confirm-end-round-button'));
            });

            await waitFor(() => {
                expect(mockInsertDeadlySinsRound).toHaveBeenCalledWith(1, 0, 0, 0, 0, 0, 1, 1);
            });
        });

        it('does not save Deadly Sins when round is at or under par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
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
                expect(mockInsertDeadlySinsRound).not.toHaveBeenCalled();
            });
        });

        it('does not double-count running total when #is re-submitted after going back', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockEndRound.mockResolvedValue(true);
            mockInsertDeadlySinsRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            // Score #1 above par (+1) then advance
            fireEvent.press(getByTestId('increment-1'));
            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByTestId('previous-hole-button')).toBeTruthy();
            });

            // Go back to #1 and re-submit at par (default score = 4)
            fireEvent.press(getByTestId('previous-hole-button'));
            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            // End round — running total should be 0 (par), so 7DS must NOT be saved
            fireEvent.press(getByTestId('end-round-button'));
            await act(async () => {
                fireEvent.press(getByTestId('confirm-end-round-button'));
            });

            await waitFor(() => {
                expect(mockInsertDeadlySinsRound).not.toHaveBeenCalled();
            });
        });
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

    describe('Multiplayer scoring', () => {
        it('calls addMultiplayerHoleScoresService on score submit', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1, 2]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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

        it('resumes active round with players on mount', () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
                { Id: 2, RoundId: 5, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
            ]);

            const { getByText, getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('continue-round-button'));

            expect(getByText('You')).toBeTruthy();
            expect(getByText('Alice')).toBeTruthy();
        });

        it('shows active round section when active round has no players', () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
            });
            mockGetRoundPlayers.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('continue-round-button'));

            expect(getByTestId('end-round-button')).toBeTruthy();
        });

        it('does not advance #when addMultiplayerHoleScoresService returns false', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(false);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('#1')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            expect(getByText('#1')).toBeTruthy();
        });

        it('advances #with zero contribution when no user player found in scores', async () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, TotalScore: 0, IsCompleted: 0,
                StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
                Created_At: '2025-06-15T10:00:00.000Z',
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 2, RoundId: 5, PlayerName: 'Alice', IsUser: 0, SortOrder: 0 },
            ]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('continue-round-button'));

            expect(getByText('#1')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

            expect(getByText('#2')).toBeTruthy();
        });
    });

    describe('7 Deadly Sins total in round history', () => {
        it('shows 7DS column header when round history exists', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('7DS')).toBeTruthy();
        });

        it('shows 7 Deadly Sins total next to matching round', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);
            mockGetAllDeadlySinsRounds.mockReturnValue([
                { Id: 1, ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 1, TroubleOffTee: 0, Penalties: 0, Total: 5, RoundId: 1, Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('5')).toBeTruthy();
        });

        it('shows dash when deadly sins row has RoundId null', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);
            mockGetAllDeadlySinsRounds.mockReturnValue([
                { Id: 1, ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 1, TroubleOffTee: 0, Penalties: 0, Total: 5, RoundId: null, Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('-')).toBeTruthy();
        });

        it('shows dash when no 7 Deadly Sins data for a round', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);
            mockGetAllDeadlySinsRounds.mockReturnValue([]);

            const { getByText } = render(<Play />);

            expect(getByText('-')).toBeTruthy();
        });
    });

    describe('18-Hole limit', () => {
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

        it('shows end round confirm after submitting Hole 18 scores', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText, queryByText } = render(<Play />);

            await startRoundAndAdvanceToHole(getByTestId, getByText, 18);

            await act(async () => {
                fireEvent.press(getByTestId('next-hole-button'));
            });

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

    describe('Post-round scorecard', () => {
        const startAndEndRound = async (getByTestId: any) => {
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
                expect(getByTestId('start-round-button')).toBeTruthy();
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
                expect(getByTestId('start-round-button')).toBeTruthy();
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
            });
            mockGetRoundPlayers.mockReturnValue([
                { Id: 1, RoundId: 5, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            ]);

            const { queryByTestId } = render(<Play />);

            expect(queryByTestId('onboarding-overlay')).toBeNull();
        });
    });

    describe('7 Deadly Sins chart', () => {
        const mock7DeadlySinsData = [
            { Id: 1, ThreePutts: 3, DoubleBogeys: 1, BogeysPar5: 2, BogeysInside9Iron: 4, DoubleChips: 0, TroubleOffTee: 1, Penalties: 2, Total: 13, Created_At: '15/06' },
            { Id: 2, ThreePutts: 2, DoubleBogeys: 3, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 2, TroubleOffTee: 3, Penalties: 1, Total: 13, Created_At: '16/06' },
        ];

        it('chart data changes when filter is changed', () => {
            // Round history: Id:1 first in array → selected by slice(0,1) when filter=1
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01', CourseName: null },
                { Id: 2, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '02/01', CourseName: null },
            ]);
            // 7DS in Id DESC order; RoundId links each 7DS entry to its round
            mockGetAllDeadlySinsRounds.mockReturnValue([
                { Id: 2, RoundId: 2, ThreePutts: 10, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 10, Created_At: '02/01' },
                { Id: 1, RoundId: 1, ThreePutts: 2, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 2, Created_At: '01/01' },
            ]);

            const { getByTestId } = render(<Play />);

            // All filter: ThreePutts = 10 + 2 = 12
            expect(getByTestId('7deadly-sins-chart-count-0')).toHaveTextContent('12');

            // Filter 1: round Id:1 selected → 7DS RoundId:1, ThreePutts = 2
            fireEvent.press(getByTestId('filter-button-1'));

            expect(getByTestId('7deadly-sins-chart-count-0')).toHaveTextContent('2');
        });

        it('filters chart by RoundId matching round history, not by independent slice', () => {
            // 3 rounds newest first; only rounds 1 and 3 have 7DS data
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 3, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '03/01', CourseName: null },
                { Id: 2, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '02/01', CourseName: null },
                { Id: 1, TotalScore: 1, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '01/01', CourseName: null },
            ]);
            // 7DS Id DESC order: 7DS for round 1 has higher Id than 7DS for round 3
            mockGetAllDeadlySinsRounds.mockReturnValue([
                { Id: 2, RoundId: 1, ThreePutts: 10, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 10, Created_At: '01/01' },
                { Id: 1, RoundId: 3, ThreePutts: 2, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 2, Created_At: '03/01' },
            ]);

            const { getByTestId } = render(<Play />);

            // All filter: ThreePutts = 10 + 2 = 12
            expect(getByTestId('7deadly-sins-chart-count-0')).toHaveTextContent('12');

            // Filter 1: most recent round (Id:3) has ThreePutts=2; independent slice would wrongly show 10
            fireEvent.press(getByTestId('filter-button-1'));

            expect(getByTestId('7deadly-sins-chart-count-0')).toHaveTextContent('2');
        });

        it('does not render chart when no 7 Deadly Sins data', () => {
            mockGetAllDeadlySinsRounds.mockReturnValue([]);

            const { queryByText } = render(<Play />);

            expect(queryByText('7 Deadly Sins')).toBeNull();
        });

        it('renders chart in idle state when data exists', () => {
            mockGetAllDeadlySinsRounds.mockReturnValue(mock7DeadlySinsData);

            const { getByText } = render(<Play />);

            expect(getByText('7 Deadly Sins')).toBeTruthy();
        });

        it('does not render chart during active round', async () => {
            mockGetAllDeadlySinsRounds.mockReturnValue(mock7DeadlySinsData);
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            expect(queryByTestId('7deadly-sins-chart-label')).toBeNull();
        });

        it('refreshes chart after ending a round', async () => {
            mockGetAllDeadlySinsRounds.mockReturnValue([]);
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
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
                expect(getByTestId('start-round-button')).toBeTruthy();
            });

            // getAllDeadlySinsRoundsService called on mount + after ending round
            expect(mockGetAllDeadlySinsRounds).toHaveBeenCalledTimes(2);
        });
    });

    describe('start round failure', () => {
        it('shows error toast when startRoundService returns null', async () => {
            mockStartRound.mockResolvedValue(null);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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

        it('onRefreshHidesOverlayAfterTimeout', () => {
            const { UNSAFE_getByType, queryByText } = render(<Play />);
            const scrollView = UNSAFE_getByType(ScrollView);

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
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

        it('onRefreshCallsGetAllDeadlySinsRoundsService', () => {
            const { UNSAFE_getByType } = render(<Play />);
            const scrollView = UNSAFE_getByType(ScrollView);

            const initialCount = mockGetAllDeadlySinsRounds.mock.calls.length;

            act(() => {
                scrollView.props.refreshControl.props.onRefresh();
            });
            act(() => {
                jest.advanceTimersByTime(750);
            });

            expect(mockGetAllDeadlySinsRounds.mock.calls.length).toBeGreaterThan(initialCount);
        });
    });

});
