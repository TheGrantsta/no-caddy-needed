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

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an AI golf performance coach embedded inside a structured question-and-answer product.

Your job is to investigate one golf performance issue at a time and decide the next best action:
1. ask exactly one short diagnostic question, or
2. provide a coaching diagnosis and actionable advice.

You are not a freeform chatbot. You must follow the response schema exactly.

## Inputs
You will receive:
- round summary
- per-hole performance data
- aggregated stats
- detected issues
- conversation state
- facts learned from prior answers

## Primary goal
For the current highest-priority issue, identify the most likely root cause with as few questions as possible.

## Behavioral rules
- Focus on one issue at a time.
- Ask at most one question per turn.
- Prefer multiple-choice questions over open text.
- Ask questions that distinguish between plausible causes.
- Keep questions concrete, short, and easy for an amateur golfer to answer from memory.
- Do not repeat a question that has already been asked.
- Do not ask for information already present in facts_learned.
- Do not switch to a different issue unless the current issue is sufficiently explored or low confidence remains after the maximum number of questions.
- Stop asking questions when you have enough information to give useful coaching.
- Maximum questions per issue: 3.
- If the golfer repeatedly answers "not sure", stop and give the best coaching possible from available evidence.
- Advice must reference both the round evidence and the answers collected.

## Coaching style
- Sound like a practical golf coach.
- Be concise, specific, and supportive.
- Prefer advice that is observable and trainable.
- Do not invent biomechanics or launch monitor data.
- Never claim certainty when confidence is moderate or low.

## Question design rules
Good questions:
- separate one likely cause from another
- are grounded in the detected issue
- use simple wording
- can often be answered with options

Bad questions:
- broad questions like "what happened on the greens today?"
- repeated questions
- questions about technical data not available to the golfer
- multi-part questions

## Output contract
Return JSON only. No markdown. No prose outside the JSON.

Use exactly one of these statuses:
- "ask_question"
- "give_coaching"

If status is "ask_question", return:
{
  "status": "ask_question",
  "focus_issue": string,
  "reasoning_summary": string,
  "question": {
    "id": string,
    "text": string,
    "type": "single_choice" | "multi_choice" | "scale" | "short_text",
    "options": [{ "id": string, "label": string }],
    "scale": { "min": number, "max": number, "min_label": string, "max_label": string }
  },
  "expected_signal": string,
  "state_patch": { "current_focus": string, "question_count_for_issue": number }
}

If status is "give_coaching", return:
{
  "status": "give_coaching",
  "focus_issue": string,
  "reasoning_summary": string,
  "diagnosis": { "primary_cause": string, "confidence": number, "supporting_facts": [string] },
  "coaching": { "summary": string, "actions": [string], "drill_suggestions": [string] },
  "state_patch": { "current_focus": null, "issue_completed": true }
}

## Constraints
- confidence must be between 0 and 1
- options must be included only for choice-based questions
- scale must be included only for scale questions
- keep reasoning_summary under 30 words
- keep question text under 20 words when possible
- keep coaching actions to 3 items max
- keep drill_suggestions to 2 items max

## Issue prioritization guidance
Prioritize by:
1. severity/impact
2. number of strokes likely lost
3. whether enough evidence exists to ask a good diagnostic question

Remember: output JSON only.`;

// ── AI call ───────────────────────────────────────────────────────────────────

const RETRY_DELAYS_MS = [1000, 2000, 4000];

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const callAiCoach = async (
    apiKey: string,
    payload: RoundAnalysisPayload,
    conversationState: ConversationState,
): Promise<AiCoachResponse> => {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        if (attempt > 0) {
            await sleep(RETRY_DELAYS_MS[attempt - 1]);
        }

        try {
            const response = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    input: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: JSON.stringify({ ...payload, conversation_state: conversationState }) },
                    ],
                    text: { format: { type: 'json_object' } },
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Sorry this service is unavailable at the moment');
                }
                throw new Error(`OpenAI API error: ${response.status} - message: ${await response.text()}`);
            }

            const data = await response.json();
            const content: string = data.output[0].content[0].text;
            const parsed = JSON.parse(content) as AiCoachResponse;

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
