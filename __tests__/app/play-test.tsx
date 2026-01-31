import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';
import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertTiger5RoundService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder } from '../../service/NotificationService';

jest.mock('../../service/DbService', () => ({
    startRoundService: jest.fn(),
    endRoundService: jest.fn(),
    addMultiplayerHoleScoresService: jest.fn(),
    getActiveRoundService: jest.fn(),
    getAllRoundHistoryService: jest.fn(),
    insertTiger5RoundService: jest.fn(),
    getClubDistancesService: jest.fn(),
    getWedgeChartService: jest.fn().mockReturnValue([]),
    insertWedgeChartService: jest.fn(),
    addRoundPlayersService: jest.fn(),
    getRoundPlayersService: jest.fn(),
}));

jest.mock('../../database/db', () => ({
    getWedgeChart: jest.fn().mockReturnValue([]),
}));

jest.mock('react-native-toast-notifications', () => ({
    useToast: () => ({
        show: jest.fn(),
    }),
}));

jest.mock('../../service/NotificationService', () => ({
    scheduleRoundReminder: jest.fn(),
    cancelRoundReminder: jest.fn(),
}));

jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        useRouter: () => ({
            push: jest.fn(),
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
const mockGetClubDistances = getClubDistancesService as jest.Mock;
const mockScheduleReminder = scheduleRoundReminder as jest.Mock;
const mockCancelReminder = cancelRoundReminder as jest.Mock;
const mockAddRoundPlayers = addRoundPlayersService as jest.Mock;
const mockGetRoundPlayers = getRoundPlayersService as jest.Mock;

describe('Play screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRound.mockReturnValue(null);
        mockGetAllRoundHistory.mockReturnValue([]);
        mockGetClubDistances.mockReturnValue([]);
        mockGetRoundPlayers.mockReturnValue([]);
    });

    describe('Idle state', () => {
        it('renders Play heading', () => {
            const { getByText } = render(<Play />);

            expect(getByText('Play')).toBeTruthy();
        });

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
                { Id: 1, CoursePar: 72, TotalScore: 3, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('Round history')).toBeTruthy();
            expect(getByText('15/06')).toBeTruthy();
            expect(getByText('+3')).toBeTruthy();
        });

        it('shows even par as E in round history', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, CoursePar: 72, TotalScore: 0, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('E')).toBeTruthy();
        });

        it('shows negative score in round history', () => {
            mockGetAllRoundHistory.mockReturnValue([
                { Id: 1, CoursePar: 72, TotalScore: -2, IsCompleted: 1, StartTime: '', EndTime: '', Created_At: '15/06' },
            ]);

            const { getByText } = render(<Play />);

            expect(getByText('-2')).toBeTruthy();
        });
    });

    describe('Player setup', () => {
        it('shows player setup when Start Round is pressed', () => {
            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            expect(getByTestId('start-button')).toBeTruthy();
            expect(getByTestId('add-player-button')).toBeTruthy();
        });

        it('starts round after player setup is completed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith(72);
                expect(mockAddRoundPlayers).toHaveBeenCalledWith(1, []);
            });
        });

        it('starts round with additional players', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1, 2]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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
                Id: 5, CoursePar: 72, TotalScore: 0, IsCompleted: 0,
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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            fireEvent.press(getByTestId('next-hole-button'));

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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            fireEvent.press(getByTestId('next-hole-button'));

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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            fireEvent.press(getByTestId('confirm-end-round-button'));

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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            fireEvent.press(getByTestId('confirm-end-round-button'));

            await waitFor(() => {
                expect(getByTestId('start-round-button')).toBeTruthy();
            });
        });

        it('hides confirm button when cancel is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('play-sub-menu-distances')).toBeTruthy();
            });

            fireEvent.press(getByTestId('play-sub-menu-distances'));

            expect(getByText('No club distances set')).toBeTruthy();
        });

        it('shows wedge chart section when Wedge chart is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('play-sub-menu-wedge-chart')).toBeTruthy();
            });

            fireEvent.press(getByTestId('play-sub-menu-wedge-chart'));

            expect(getByText('Your wedge distances')).toBeTruthy();
        });

        it('returns to score input when Play is pressed after switching', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);
            mockGetClubDistances.mockReturnValue([]);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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

            expect(getByText('No club distances set')).toBeTruthy();
            expect(queryByTestId('start-round-button')).toBeNull();
        });

        it('shows wedge chart when Wedge chart is pressed without active round', () => {
            const { getByTestId, getByText, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-wedge-chart'));

            expect(getByText('Your wedge distances')).toBeTruthy();
            expect(queryByTestId('start-round-button')).toBeNull();
        });

        it('returns to idle state when Play is pressed after viewing distances', () => {
            mockGetClubDistances.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('play-sub-menu-distances'));
            fireEvent.press(getByTestId('play-sub-menu-score'));

            expect(getByTestId('start-round-button')).toBeTruthy();
        });
    });

    describe('Tiger 5 integration', () => {
        it('does not show Tiger 5 tally when at or under par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            expect(queryByText('3-putts')).toBeNull();
        });

        it('shows Tiger 5 tally when score is changed to over par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, getByText, queryByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('increment-1')).toBeTruthy();
            });

            expect(queryByText('3-putts')).toBeNull();

            // Increment score to be above par
            fireEvent.press(getByTestId('increment-1'));

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Double bogeys')).toBeTruthy();
        });

        it('does not show Score/Tiger 5 toggle buttons', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddRoundPlayers.mockResolvedValue([1]);

            const { getByTestId, queryByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));
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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            // Increment score to be above par, then submit
            fireEvent.press(getByTestId('increment-1'));
            fireEvent.press(getByTestId('next-hole-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            fireEvent.press(getByTestId('confirm-end-round-button'));

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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            fireEvent.press(getByTestId('confirm-end-round-button'));

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
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));
            fireEvent.press(getByTestId('confirm-end-round-button'));

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
            fireEvent.press(getByTestId('add-player-button'));
            fireEvent.changeText(getByTestId('player-name-input-0'), 'Alice');
            fireEvent.press(getByTestId('start-button'));

            await waitFor(() => {
                expect(getByTestId('next-hole-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('next-hole-button'));

            await waitFor(() => {
                expect(mockAddMultiplayerHoleScores).toHaveBeenCalled();
            });
        });

        it('resumes active round with players on mount', () => {
            mockGetActiveRound.mockReturnValue({
                Id: 5, CoursePar: 72, TotalScore: 0, IsCompleted: 0,
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
});
