import { useState, useCallback } from 'react';
import {
    deleteRoundService,
    endRoundService,
    getAllRoundHistoryService,
    getRecentCourseNamesService,
    RoundPlayer,
    saveHoleNoteService,
} from '../service/DbService';
import { cancelRoundReminder } from '../service/NotificationService';
import { logEvent } from '../service/FirebaseService';
import { maybeRequestRoundReviewService } from '../service/ReviewService';
import { buildSummaryForRoundService } from '../service/RoundSummaryService';
import { RoundSummary as RoundSummaryData } from '../utils/roundSummary';
import { useToggle } from './useToggle';

type ScoreEntry = { playerId: number; playerName: string; score: number };
export type CurrentHoleData = { holeNumber: number; holePar: number; scores: ScoreEntry[] } | null;

type Options = {
    currentHole: number;
    skipStatsFlow: boolean;
    // Clears the hole-level state (from useHoleLifecycle.resetAll)
    resetHoleState: () => void;
    showResult: (success: boolean, successMessage: string, errorMessage: string) => void;
};

// Owns the state for the round in progress (its id, players, course and notes) and the
// end-of-round flow: discard, save, summary, and return to idle.
export function useRoundSession({ currentHole, skipStatsFlow, resetHoleState, showResult }: Options) {
    const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [players, setPlayers] = useState<RoundPlayer[]>([]);
    const [currentHoleData, setCurrentHoleData] = useState<CurrentHoleData>(null);
    const [showEndRoundConfirm, , setShowEndRoundConfirm] = useToggle(false);
    const [roundSummary, setRoundSummary] = useState<RoundSummaryData | null>(null);
    const [recentCourseNames, setRecentCourseNames] = useState<string[]>([]);
    const [roundStartHole, setRoundStartHole] = useState(1);
    const [courseHolePars, setCourseHolePars] = useState<Record<number, number>>({});
    const [activeCourseName, setActiveCourseName] = useState<string | null>(null);
    const [courseNotes, setCourseNotes] = useState<Record<number, string>>({});
    const [currentNoteText, setCurrentNoteText] = useState('');

    const resetSession = useCallback(() => {
        resetHoleState();
        setActiveRoundId(null);
        setRoundStartHole(1);
        setPlayers([]);
        setCurrentHoleData(null);
        setShowEndRoundConfirm(false);
        setCourseHolePars({});
        setActiveCourseName(null);
        setCourseNotes({});
        setCurrentNoteText('');
        setRecentCourseNames(getRecentCourseNamesService());
    }, [resetHoleState, setShowEndRoundConfirm]);

    const discardRound = async () => {
        if (!activeRoundId) return;
        const success = await deleteRoundService(activeRoundId);
        if (notificationId) {
            await cancelRoundReminder(notificationId);
            setNotificationId(null);
        }
        resetSession();
        showResult(success, 'Round discarded', 'Failed to discard round');
    };

    const confirmEndRound = async () => {
        if (!activeRoundId) return;

        logEvent('end_round');
        await cancelRoundReminder(notificationId);
        setNotificationId(null);

        if (activeCourseName !== null) {
            await saveHoleNoteService(activeCourseName, currentHole, currentNoteText);
        }

        const success = await endRoundService(activeRoundId);
        showResult(success, 'Round saved', 'Failed to save round');

        const summary = buildSummaryForRoundService(activeRoundId, skipStatsFlow);
        if (summary) {
            setShowEndRoundConfirm(false);
            setRoundSummary(summary);
        } else {
            resetSession();
        }
    };

    const finishSummary = async () => {
        setRoundSummary(null);
        resetSession();
        // Ask for a review from the 7th completed round, then every 6th (7, 13, 19, …).
        const roundCount = getAllRoundHistoryService().length;
        const prompted = await maybeRequestRoundReviewService(roundCount);
        if (prompted) {
            logEvent('review_requested', { roundNumber: roundCount });
        }
    };

    const viewPerformance = () => {
        setRoundSummary(null);
        resetSession();
    };

    return {
        activeRoundId,
        setActiveRoundId,
        notificationId,
        setNotificationId,
        players,
        setPlayers,
        currentHoleData,
        setCurrentHoleData,
        showEndRoundConfirm,
        setShowEndRoundConfirm,
        roundSummary,
        setRoundSummary,
        recentCourseNames,
        setRecentCourseNames,
        roundStartHole,
        setRoundStartHole,
        courseHolePars,
        setCourseHolePars,
        activeCourseName,
        setActiveCourseName,
        courseNotes,
        setCourseNotes,
        currentNoteText,
        setCurrentNoteText,
        resetSession,
        discardRound,
        confirmEndRound,
        finishSummary,
        viewPerformance,
    };
}
