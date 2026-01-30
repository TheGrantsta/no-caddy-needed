import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Play from '../../app/(tabs)/play';
import {
    startRoundService,
    endRoundService,
    addHoleScoreService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertTiger5RoundService,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder } from '../../service/NotificationService';

jest.mock('../../service/DbService', () => ({
    startRoundService: jest.fn(),
    endRoundService: jest.fn(),
    addHoleScoreService: jest.fn(),
    getActiveRoundService: jest.fn(),
    getAllRoundHistoryService: jest.fn(),
    insertTiger5RoundService: jest.fn(),
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
const mockAddHoleScore = addHoleScoreService as jest.Mock;
const mockGetActiveRound = getActiveRoundService as jest.Mock;
const mockGetAllRoundHistory = getAllRoundHistoryService as jest.Mock;
const mockInsertTiger5Round = insertTiger5RoundService as jest.Mock;
const mockScheduleReminder = scheduleRoundReminder as jest.Mock;
const mockCancelReminder = cancelRoundReminder as jest.Mock;

describe('Play screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRound.mockReturnValue(null);
        mockGetAllRoundHistory.mockReturnValue([]);
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

        it('shows course par input', () => {
            const { getByTestId } = render(<Play />);

            expect(getByTestId('course-par-input')).toBeTruthy();
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

    describe('Starting a round', () => {
        it('starts a round when Start Round is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddHoleScore.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(mockStartRound).toHaveBeenCalledWith(72);
            });
        });

        it('shows hole score input after starting round', async () => {
            mockStartRound.mockResolvedValue(1);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

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

            const { getByText, getByTestId } = render(<Play />);

            expect(getByText(/Hole/)).toBeTruthy();
            expect(getByTestId('end-round-button')).toBeTruthy();
        });

        it('advances to next hole after scoring', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddHoleScore.mockResolvedValue(true);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });

            fireEvent.press(getByTestId('score-button-0'));

            await waitFor(() => {
                expect(getByText('Hole 2')).toBeTruthy();
            });
        });

        it('shows running total during round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddHoleScore.mockResolvedValue(true);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('running-total')).toBeTruthy();
            });
        });

        it('shows Round in progress text during active round', async () => {
            mockStartRound.mockResolvedValue(1);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByText('Round in progress')).toBeTruthy();
            });
        });
    });

    describe('Ending a round', () => {
        it('calls endRoundService when End Round is pressed', async () => {
            mockStartRound.mockResolvedValue(1);
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            await waitFor(() => {
                expect(mockEndRound).toHaveBeenCalledWith(1);
            });
        });

        it('returns to idle state after ending round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            await waitFor(() => {
                expect(getByTestId('start-round-button')).toBeTruthy();
            });
        });
    });

    describe('Tiger 5 integration', () => {
        it('shows Tiger 5 toggle during active round', async () => {
            mockStartRound.mockResolvedValue(1);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('toggle-tiger5')).toBeTruthy();
            });
        });

        it('shows Score view by default during active round', async () => {
            mockStartRound.mockResolvedValue(1);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByText('Hole 1')).toBeTruthy();
            });
        });

        it('switches to Tiger 5 view when toggle is pressed', async () => {
            mockStartRound.mockResolvedValue(1);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('toggle-tiger5')).toBeTruthy();
            });

            fireEvent.press(getByTestId('toggle-tiger5'));

            expect(getByText('3-putts')).toBeTruthy();
            expect(getByText('Double bogeys')).toBeTruthy();
        });

        it('switches back to Score view when toggle is pressed again', async () => {
            mockStartRound.mockResolvedValue(1);

            const { getByTestId, getByText } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('toggle-tiger5')).toBeTruthy();
            });

            fireEvent.press(getByTestId('toggle-tiger5'));
            fireEvent.press(getByTestId('toggle-score'));

            expect(getByText('Hole 1')).toBeTruthy();
        });

        it('saves Tiger 5 when round ends above par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockAddHoleScore.mockResolvedValue(true);
            mockEndRound.mockResolvedValue(true);
            mockInsertTiger5Round.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('score-button-1')).toBeTruthy();
            });

            // Score +1 on hole 1 (above par)
            fireEvent.press(getByTestId('score-button-1'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            await waitFor(() => {
                expect(mockInsertTiger5Round).toHaveBeenCalled();
            });
        });

        it('does not save Tiger 5 when round is at or under par', async () => {
            mockStartRound.mockResolvedValue(1);
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            await waitFor(() => {
                expect(mockInsertTiger5Round).not.toHaveBeenCalled();
            });
        });
    });

    describe('Notifications', () => {
        it('schedules a reminder when starting a round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockScheduleReminder.mockResolvedValue('notif-123');

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(mockScheduleReminder).toHaveBeenCalled();
            });
        });

        it('cancels the reminder when ending a round', async () => {
            mockStartRound.mockResolvedValue(1);
            mockScheduleReminder.mockResolvedValue('notif-123');
            mockEndRound.mockResolvedValue(true);
            mockGetAllRoundHistory.mockReturnValue([]);

            const { getByTestId } = render(<Play />);

            fireEvent.press(getByTestId('start-round-button'));

            await waitFor(() => {
                expect(getByTestId('end-round-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('end-round-button'));

            await waitFor(() => {
                expect(mockCancelReminder).toHaveBeenCalledWith('notif-123');
            });
        });
    });
});
