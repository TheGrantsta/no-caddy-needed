import { renderHook, act } from '@testing-library/react-native';
import { useRoundSession } from '../../hooks/useRoundSession';
import {
    deleteRoundService,
    endRoundService,
    getAllRoundHistoryService,
    getRecentCourseNamesService,
    saveHoleNoteService,
} from '../../service/DbService';
import { cancelRoundReminder } from '../../service/NotificationService';
import { logEvent } from '../../service/FirebaseService';
import { maybeRequestRoundReviewService } from '../../service/ReviewService';
import { buildSummaryForRoundService } from '../../service/RoundSummaryService';

jest.mock('../../service/DbService', () => ({
    deleteRoundService: jest.fn(),
    endRoundService: jest.fn(),
    getAllRoundHistoryService: jest.fn(),
    getRecentCourseNamesService: jest.fn(),
    saveHoleNoteService: jest.fn(),
}));
jest.mock('../../service/NotificationService', () => ({
    cancelRoundReminder: jest.fn(),
}));
jest.mock('../../service/FirebaseService', () => ({
    logEvent: jest.fn(),
}));
jest.mock('../../service/ReviewService', () => ({
    maybeRequestRoundReviewService: jest.fn(),
}));
jest.mock('../../service/RoundSummaryService', () => ({
    buildSummaryForRoundService: jest.fn(),
}));

const mockDelete = deleteRoundService as jest.Mock;
const mockEnd = endRoundService as jest.Mock;
const mockHistory = getAllRoundHistoryService as jest.Mock;
const mockRecents = getRecentCourseNamesService as jest.Mock;
const mockSaveNote = saveHoleNoteService as jest.Mock;
const mockCancelReminder = cancelRoundReminder as jest.Mock;
const mockLogEvent = logEvent as jest.Mock;
const mockReview = maybeRequestRoundReviewService as jest.Mock;
const mockSummary = buildSummaryForRoundService as jest.Mock;

const renderSession = (overrides: Partial<{ currentHole: number; skipStatsFlow: boolean }> = {}) => {
    const resetHoleState = jest.fn();
    const showResult = jest.fn();
    const utils = renderHook(() =>
        useRoundSession({
            currentHole: overrides.currentHole ?? 3,
            skipStatsFlow: overrides.skipStatsFlow ?? false,
            resetHoleState,
            showResult,
        })
    );
    return { ...utils, resetHoleState, showResult };
};

// Puts a live round in the session, as beginRound does on the play screen
const startLiveRound = (session: ReturnType<typeof renderSession>, roundId = 7) => {
    act(() => {
        session.result.current.setActiveRoundId(roundId);
        session.result.current.setNotificationId('notif-1');
        session.result.current.setActiveCourseName('Augusta');
        session.result.current.setCurrentNoteText('Watch the wind');
        session.result.current.setPlayers([{ Id: 1 } as any]);
        session.result.current.setShowEndRoundConfirm(true);
    });
};

describe('useRoundSession', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRecents.mockReturnValue(['Augusta', 'Pebble']);
        mockHistory.mockReturnValue([]);
        mockSummary.mockReturnValue(null);
    });

    describe('initial state', () => {
        it('shouldStartWithNoActiveRoundAndTheFirstHoleAsTheStart', () => {
            const { result } = renderSession();

            expect(result.current.activeRoundId).toBeNull();
            expect(result.current.roundStartHole).toBe(1);
            expect(result.current.players).toEqual([]);
            expect(result.current.showEndRoundConfirm).toBe(false);
            expect(result.current.roundSummary).toBeNull();
        });
    });

    describe('resetSession', () => {
        it('shouldClearTheRoundAndCourseStateAndRestoreRecentCourses', () => {
            const session = renderSession();
            startLiveRound(session);

            act(() => {
                session.result.current.resetSession();
            });

            expect(session.result.current.activeRoundId).toBeNull();
            expect(session.result.current.activeCourseName).toBeNull();
            expect(session.result.current.currentNoteText).toBe('');
            expect(session.result.current.players).toEqual([]);
            expect(session.result.current.showEndRoundConfirm).toBe(false);
            expect(session.result.current.recentCourseNames).toEqual(['Augusta', 'Pebble']);
        });

        it('shouldResetTheHoleStateSoItDoesNotCarryIntoTheNextRound', () => {
            const session = renderSession();

            act(() => {
                session.result.current.resetSession();
            });

            expect(session.resetHoleState).toHaveBeenCalledTimes(1);
        });
    });

    describe('discardRound', () => {
        it('shouldDoNothingWhenThereIsNoActiveRound', async () => {
            const session = renderSession();

            await act(async () => {
                await session.result.current.discardRound();
            });

            expect(mockDelete).not.toHaveBeenCalled();
            expect(session.showResult).not.toHaveBeenCalled();
        });

        it('shouldDeleteTheRoundCancelItsReminderResetAndReportSuccess', async () => {
            mockDelete.mockResolvedValue(true);
            const session = renderSession();
            startLiveRound(session, 7);

            await act(async () => {
                await session.result.current.discardRound();
            });

            expect(mockDelete).toHaveBeenCalledWith(7);
            expect(mockCancelReminder).toHaveBeenCalledWith('notif-1');
            expect(session.result.current.notificationId).toBeNull();
            expect(session.result.current.activeRoundId).toBeNull();
            expect(session.resetHoleState).toHaveBeenCalled();
            expect(session.showResult).toHaveBeenCalledWith(true, 'Round discarded', 'Failed to discard round');
        });

        it('shouldReportFailureWhenTheDeleteFails', async () => {
            mockDelete.mockResolvedValue(false);
            const session = renderSession();
            startLiveRound(session, 7);

            await act(async () => {
                await session.result.current.discardRound();
            });

            expect(session.showResult).toHaveBeenCalledWith(false, 'Round discarded', 'Failed to discard round');
        });
    });

    describe('confirmEndRound', () => {
        it('shouldDoNothingWhenThereIsNoActiveRound', async () => {
            const session = renderSession();

            await act(async () => {
                await session.result.current.confirmEndRound();
            });

            expect(mockEnd).not.toHaveBeenCalled();
            expect(mockLogEvent).not.toHaveBeenCalled();
        });

        it('shouldSaveTheCurrentHoleNoteWhenACourseIsActive', async () => {
            mockEnd.mockResolvedValue(true);
            const session = renderSession({ currentHole: 3 });
            startLiveRound(session, 7);

            await act(async () => {
                await session.result.current.confirmEndRound();
            });

            expect(mockSaveNote).toHaveBeenCalledWith('Augusta', 3, 'Watch the wind');
            expect(mockEnd).toHaveBeenCalledWith(7);
        });

        it('shouldShowTheSummaryAndKeepTheRoundWhenASummaryIsAvailable', async () => {
            mockEnd.mockResolvedValue(true);
            const summary = { totals: { score: 80 } } as any;
            mockSummary.mockReturnValue(summary);
            const session = renderSession({ skipStatsFlow: true });
            startLiveRound(session, 7);

            await act(async () => {
                await session.result.current.confirmEndRound();
            });

            expect(mockSummary).toHaveBeenCalledWith(7, true);
            expect(session.result.current.roundSummary).toBe(summary);
            expect(session.result.current.showEndRoundConfirm).toBe(false);
            expect(session.result.current.activeRoundId).toBe(7);
            expect(session.resetHoleState).not.toHaveBeenCalled();
        });

        it('shouldReturnToIdleWhenThereIsNoSummary', async () => {
            mockEnd.mockResolvedValue(true);
            const session = renderSession();
            startLiveRound(session, 7);

            await act(async () => {
                await session.result.current.confirmEndRound();
            });

            expect(session.result.current.roundSummary).toBeNull();
            expect(session.result.current.activeRoundId).toBeNull();
            expect(session.resetHoleState).toHaveBeenCalled();
            expect(session.showResult).toHaveBeenCalledWith(true, 'Round saved', 'Failed to save round');
        });

        it('shouldLogTheEndRoundEvent', async () => {
            mockEnd.mockResolvedValue(true);
            const session = renderSession();
            startLiveRound(session, 7);

            await act(async () => {
                await session.result.current.confirmEndRound();
            });

            expect(mockLogEvent).toHaveBeenCalledWith('end_round');
        });
    });

    describe('finishSummary', () => {
        it('shouldClearTheSummaryReturnToIdleAndRequestAReviewAtTheRoundCount', async () => {
            mockHistory.mockReturnValue([{}, {}, {}, {}, {}, {}, {}]);
            mockReview.mockResolvedValue(true);
            const session = renderSession();
            act(() => {
                session.result.current.setRoundSummary({ totals: {} } as any);
            });

            await act(async () => {
                await session.result.current.finishSummary();
            });

            expect(session.result.current.roundSummary).toBeNull();
            expect(session.resetHoleState).toHaveBeenCalled();
            expect(mockReview).toHaveBeenCalledWith(7);
            expect(mockLogEvent).toHaveBeenCalledWith('review_requested', { roundNumber: 7 });
        });

        it('shouldNotLogAReviewRequestWhenNoneWasMade', async () => {
            mockReview.mockResolvedValue(false);
            const session = renderSession();

            await act(async () => {
                await session.result.current.finishSummary();
            });

            expect(mockLogEvent).not.toHaveBeenCalledWith('review_requested', expect.anything());
        });
    });

    describe('viewPerformance', () => {
        it('shouldClearTheSummaryAndReturnToIdle', () => {
            const session = renderSession();
            act(() => {
                session.result.current.setRoundSummary({ totals: {} } as any);
            });

            act(() => {
                session.result.current.viewPerformance();
            });

            expect(session.result.current.roundSummary).toBeNull();
            expect(session.resetHoleState).toHaveBeenCalled();
        });
    });
});
