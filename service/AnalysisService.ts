import { getMultiplayerScorecardService, getDeadlySinsForRoundService, DeadlySinsRound } from './DbService';

// ── Conversation types ────────────────────────────────────────────────────────

export type Answer = {
    question_id: string;
    question_text: string;
    answer: { option_id?: string; label?: string; value?: number | string };
};

export type ConversationState = {
    current_focus: string | null;
    question_count_for_issue: number;
    asked_question_ids: string[];
    facts_learned: Record<string, string>;
    answers: Answer[];
};

// ── AI response types ─────────────────────────────────────────────────────────

export type QuestionOption = { id: string; label: string };

export type QuestionScale = {
    min: number;
    max: number;
    min_label: string;
    max_label: string;
};

export type AiQuestion = {
    id: string;
    text: string;
    type: 'single_choice' | 'multi_choice' | 'scale' | 'short_text';
    options?: QuestionOption[];
    scale?: QuestionScale;
};

export type AskQuestionResponse = {
    status: 'ask_question';
    focus_issue: string;
    reasoning_summary: string;
    question: AiQuestion;
    expected_signal: string;
    state_patch: {
        current_focus: string;
        question_count_for_issue: number;
    };
};

export type GiveCoachingResponse = {
    status: 'give_coaching';
    focus_issue: string;
    reasoning_summary: string;
    diagnosis: {
        primary_cause: string;
        confidence: number;
        supporting_facts: string[];
    };
    coaching: {
        summary: string;
        actions: string[];
        drill_suggestions: string[];
    };
    state_patch: {
        current_focus: null;
        issue_completed: true;
    };
};

export type AiCoachResponse = AskQuestionResponse | GiveCoachingResponse;

// ── AI call ───────────────────────────────────────────────────────────────────

const RETRY_DELAYS_MS = [1000, 2000, 4000];

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const callAiCoach = async (
    payload: RoundAnalysisPayload,
    conversationState: ConversationState,
): Promise<AiCoachResponse> => {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        if (attempt > 0) {
            await sleep(RETRY_DELAYS_MS[attempt - 1]);
        }

        try {
            const proxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL ?? '';
            const appSecret = process.env.EXPO_PUBLIC_APP_SECRET;

            const response = await fetch(`${proxyUrl}/coach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(appSecret ? { 'X-App-Secret': appSecret } : {}),
                },
                body: JSON.stringify({ payload, conversationState }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Sorry this service is unavailable at the moment');
                }
                throw new Error(`Proxy error: ${response.status} - message: ${await response.text()}`);
            }

            const parsed = await response.json() as AiCoachResponse;

            if (parsed.status !== 'ask_question' && parsed.status !== 'give_coaching') {
                throw new Error(`Unexpected AI response status: ${(parsed as { status: string }).status}`);
            }

            return parsed;
        } catch (e) {
            const error = e as Error;
            if (error.message === 'Sorry this service is unavailable at the moment') {
                throw error;
            }
            lastError = error;
        }
    }

    throw lastError;
};

export type DetectedIssue = {
    issue_type: string;
    severity: 'high' | 'medium';
    evidence: { count: number };
    possible_causes: string[];
};

export type RoundAnalysisPayload = {
    round: {
        round_id: string;
        score: number;
        course_par: number;
        holes: { hole: number; par: number; score: number }[];
        deadly_sins: {
            three_putts: number;
            double_bogeys: number;
            trouble_off_tee: number;
            penalties: number;
            double_chips: number;
            bogeys_inside_9iron: number;
            bogeys_par_5: number;
        };
    };
    detected_issues: DetectedIssue[];
};

const POSSIBLE_CAUSES: Record<string, string[]> = {
    three_putts: ['poor_lag_distance_control', 'green_speed_misjudgment', 'poor_green_reading', 'missed_short_second_putts'],
    double_bogeys: ['poor_iron_play', 'trouble_recovery', 'poor_short_game'],
    trouble_off_tee: ['alignment_issues', 'swing_path_error', 'poor_course_management'],
    penalties: ['aggressive_course_management', 'poor_ball_striking', 'poor_decision_making'],
    double_chips: ['poor_contact', 'improper_club_selection', 'poor_lie_assessment'],
    bogeys_inside_9iron: ['poor_ball_striking', 'improper_club_selection', 'poor_distance_control'],
    bogeys_par_5: ['poor_course_management', 'poor_layup_strategy', 'poor_short_game'],
};

const buildDetectedIssues = (sins: DeadlySinsRound): DetectedIssue[] => {
    const entries: { type: string; count: number }[] = [
        { type: 'three_putts', count: sins.ThreePutts },
        { type: 'double_bogeys', count: sins.DoubleBogeys },
        { type: 'trouble_off_tee', count: sins.TroubleOffTee },
        { type: 'penalties', count: sins.Penalties },
        { type: 'double_chips', count: sins.DoubleChips },
        { type: 'bogeys_inside_9iron', count: sins.BogeysInside9Iron },
        { type: 'bogeys_par_5', count: sins.BogeysPar5 },
    ];

    return entries
        .filter(e => e.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(e => ({
            issue_type: e.type,
            severity: e.count >= 3 ? 'high' : 'medium',
            evidence: { count: e.count },
            possible_causes: POSSIBLE_CAUSES[e.type],
        }));
};

export const buildRoundAnalysisPayload = (roundId: number): RoundAnalysisPayload | null => {
    const scorecard = getMultiplayerScorecardService(roundId);
    if (!scorecard) return null;

    const sins = getDeadlySinsForRoundService(roundId);

    const userPlayer = scorecard.players.find(p => p.IsUser === 1);
    const userHoleScores = userPlayer
        ? scorecard.holeScores
            .filter(s => s.RoundPlayerId === userPlayer.Id)
            .sort((a, b) => a.HoleNumber - b.HoleNumber)
        : [];

    const uniqueHoleNumbers = [...new Set(userHoleScores.map(s => s.HoleNumber))];
    const coursePar = uniqueHoleNumbers.reduce((sum, h) => {
        const hs = userHoleScores.find(s => s.HoleNumber === h);
        return sum + (hs?.HolePar ?? 0);
    }, 0);
    const strokeTotal = userHoleScores.reduce((sum, s) => sum + s.Score, 0);

    const deadlySins = sins
        ? {
            three_putts: sins.ThreePutts,
            double_bogeys: sins.DoubleBogeys,
            trouble_off_tee: sins.TroubleOffTee,
            penalties: sins.Penalties,
            double_chips: sins.DoubleChips,
            bogeys_inside_9iron: sins.BogeysInside9Iron,
            bogeys_par_5: sins.BogeysPar5,
        }
        : {
            three_putts: 0,
            double_bogeys: 0,
            trouble_off_tee: 0,
            penalties: 0,
            double_chips: 0,
            bogeys_inside_9iron: 0,
            bogeys_par_5: 0,
        };

    return {
        round: {
            round_id: `r_${roundId}`,
            score: strokeTotal,
            course_par: coursePar,
            holes: userHoleScores.map(s => ({ hole: s.HoleNumber, par: s.HolePar, score: s.Score })),
            deadly_sins: deadlySins,
        },
        detected_issues: sins ? buildDetectedIssues(sins) : [],
    };
};
