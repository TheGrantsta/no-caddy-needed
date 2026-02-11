import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';

import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertTiger5RoundService,
    getAllTiger5RoundsService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
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
    useStyles: () => require('../../assets/stlyes').default,
}));

jest.mock('../../service/DbService', () => ({
    startRoundService: jest.fn(),
    endRoundService: jest.fn(),
    addMultiplayerHoleScoresService: jest.fn(),
    getActiveRoundService: jest.fn(),
    getAllRoundHistoryService: jest.fn(),
    insertTiger5RoundService: jest.fn(),
    getAllTiger5RoundsService: jest.fn(),
    getClubDistancesService: jest.fn(),
    getWedgeChartService: jest.fn().mockReturnValue({ distanceNames: [], clubs: [] }),
    saveWedgeChartService: jest.fn(),
    addRoundPlayersService: jest.fn(),
    getRoundPlayersService: jest.fn(),
    getMultiplayerScorecardService: jest.fn(),
    getRecentCourseNamesService: jest.fn(),
    getSettingsService: jest.fn().mockReturnValue({
        theme: 'dark',
        notificationsEnabled: true,
        wedgeChartOnboardingSeen: true,
        distancesOnboardingSeen: true,
        playOnboardingSeen: true,
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
const mockInsertTiger5Round = insertTiger5RoundService as jest.Mock;
const mockGetAllTiger5Rounds = getAllTiger5RoundsService as jest.Mock;
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockScheduleReminder = scheduleRoundReminder as jest.Mock;
const mockCancelReminder = cancelRoundReminder as jest.Mock;
const mockAddRoundPlayers = addRoundPlayersService as jest.Mock;
const mockGetRoundPlayers = getRoundPlayersService as jest.Mock;
const mockGetMultiplayerScorecard = getMultiplayerScorecardService as jest.Mock;
const mockGetRecentCourseNames = getRecentCourseNamesService as jest.Mock;
const mockGetSettingsService = getSettingsService as jest.Mock;
const mockSaveSettingsService = saveSettingsService as jest.Mock;

describe('Play screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRound.mockReturnValue(null);
        mockGetAllRoundHistory.mockReturnValue([]);
        mockGetAllTiger5Rounds.mockReturnValue([]);
        mockGetClubDistances.mockReturnValue([]);
        mockGetRoundPlayers.mockReturnValue([]);
        mockGetMultiplayerScorecard.mockReturnValue(null);
        mockGetRecentCourseNames.mockReturnValue([]);
    });

    describe('Idle state', () => {
        it('shows Start Round button when no active round', () => {
            const { getByTestId } = render(<Play />);

            expect(getByTestId('start-round-button')).toBeTruthy();
        });

        it('shows no round history message when empty', () => {
            const { getByText } = render(<Play />);

            expect(getByText('No round history yet')).toBeTruthy();
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

        it('limits round history to 30 items', () => {
            const rounds = Array.from({ length: 35 }, (_, i) => ({
                Id: i + 1, TotalScore: i, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: `${String(i + 1).padStart(2, '0')}/01`,
            }));
            mockGetAllRoundHistory.mockReturnValue(rounds);

            const { getByText, queryByText } = render(<Play />);

            expect(getByText('30/01')).toBeTruthy();
            expect(queryByText('31/01')).toBeNull();
        });

        it('renders round history in a scrollable container', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByTestId } = render(<Play />);

            expect(getByTestId('round-history-scroll')).toBeTruthy();
        });

        it('renders date column at 70% width and score and t5 columns at 15% width', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06', CourseName: null },
            ]);

            const { getByTestId } = render(<Play />);

            const dateHeader = getByTestId('round-history-header-date');
            const scoreHeader = getByTestId('round-history-header-score');
            const t5Header = getByTestId('round-history-header-t5');

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
                expect(getByText('Hole 1')).toBeTruthy();
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
        it('shows hole score input after player setup completed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
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

            expect(getByText(/Hole/)).toBeTruthy();
            expect(getByTestId('end-round-button')).toBeTruthy();
        });

        it('advances to next hole after scoring', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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
        });

        it('submits default par scores when next hole pressed without changing score', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            expect(queryByText('Round in progress')).toBeNull();
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
                expect(getByText('Hole 1')).toBeTruthy();
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

            expect(getByText('Club carry distances')).toBeTruthy();
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

            expect(getByText('Your wedge carry distances')).toBeTruthy();
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

            expect(getByText('Hole 1')).toBeTruthy();
        });

        it('shows distances when Distances is pressed without active round', () => {
            mockGetClubDistances.mockReturnValue([]);

            const { getByTestId, getByText, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-distances'));

            expect(getByText('Club carry distances')).toBeTruthy();
            expect(queryByTestId('start-round-button')).toBeNull();
        });

        it('shows wedge chart when Wedge chart is pressed without active round', () => {
            const { getByTestId, getByText, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-wedge-chart'));

            expect(getByText('Your wedge carry distances')).toBeTruthy();
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

    describe('Tiger 5 integration', () => {
        it('shows Tiger 5 tally when round starts', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Double bogeys')).toBeTruthy();
            expect(getByText('Bogeys inside 9-iron')).toBeTruthy();
            expect(getByText('Double chips')).toBeTruthy();
        });

        it('does not show Score/Tiger 5 toggle buttons', async () => {
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
            expect(queryByTestId('toggle-tiger5')).toBeNull();
        });

        it('saves Tiger 5 when round ends above par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockAddMultiplayerHoleScores.mockResolvedValue(true);
            mockEndRound.mockResolvedValue(true);
            mockInsertTiger5Round.mockResolvedValue(true);
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
                expect(mockInsertTiger5Round).toHaveBeenCalled();
            });
        });

        it('does not save Tiger 5 when round is at or under par', async () => {
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
                expect(mockInsertTiger5Round).not.toHaveBeenCalled();
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

            const { getByText } = render(<Play />);

            expect(getByText('You')).toBeTruthy();
            expect(getByText('Alice')).toBeTruthy();
        });
    });

    describe('Tiger 5 total in round history', () => {
        it('shows T5 column header when round history exists', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('T5')).toBeTruthy();
        });

        it('shows Tiger5 total next to matching round', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);
            mockGetAllTiger5Rounds.mockReturnValue([
                { Id: 1, ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 1, Total: 5, Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('5')).toBeTruthy();
        });

        it('shows dash when no Tiger5 data for a round', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);
            mockGetAllTiger5Rounds.mockReturnValue([]);

            const { getByText } = render(<Play />);

            expect(getByText('-')).toBeTruthy();
        });
    });

    describe('18-hole limit', () => {
        const startRoundAndAdvanceToHole = async (getByTestId: any, getByText: any, targetHole: number) => {
            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            for (let i = 1; i < targetHole; i++) {
                await act(async () => {
                    fireEvent.press(getByTestId('next-hole-button'));
                });
                await waitFor(() => {
                    expect(getByText(`Hole ${i + 1}`)).toBeTruthy();
                });
            }
        };

        it('shows end round confirm after submitting hole 18 scores', async () => {
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

            expect(queryByText('Hole 19')).toBeNull();
        });

        it('saves hole 18 scores before showing end round confirmation', async () => {
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

    describe('Tiger 5 chart', () => {
        const mockTiger5Data = [
            { Id: 1, ThreePutts: 3, DoubleBogeys: 1, BogeysPar5: 2, BogeysInside9Iron: 4, DoubleChips: 0, Total: 10, Created_At: '15/06' },
            { Id: 2, ThreePutts: 2, DoubleBogeys: 3, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 2, Total: 9, Created_At: '16/06' },
        ];

        it('does not render chart when no Tiger 5 data', () => {
            mockGetAllTiger5Rounds.mockReturnValue([]);

            const { queryByText } = render(<Play />);

            expect(queryByText('Tiger 5')).toBeNull();
        });

        it('renders chart in idle state when data exists', () => {
            mockGetAllTiger5Rounds.mockReturnValue(mockTiger5Data);

            const { getByText } = render(<Play />);

            expect(getByText('Tiger 5')).toBeTruthy();
        });

        it('does not render chart during active round', async () => {
            mockGetAllTiger5Rounds.mockReturnValue(mockTiger5Data);
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.changeText(getByTestId('course-name-input'), 'Test Course');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            expect(queryByText('Tiger 5')).toBeNull();
        });

        it('refreshes chart after ending a round', async () => {
            mockGetAllTiger5Rounds.mockReturnValue([]);
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

            // getAllTiger5RoundsService called on mount + after ending round
            expect(mockGetAllTiger5Rounds).toHaveBeenCalledTimes(2);
        });
    });

});
