import { callAiCoach, RoundAnalysisPayload, ConversationState } from '../../service/AnalysisService';

const makePayload = (): RoundAnalysisPayload => ({
    round: {
        round_id: 'r_5',
        score: 89,
        course_par: 72,
        holes: [{ hole: 1, par: 4, score: 5 }],
        deadly_sins: {
            three_putts: 4,
            double_bogeys: 3,
            trouble_off_tee: 3,
            penalties: 0,
            double_chips: 1,
            bogeys_inside_9iron: 2,
            bogeys_par_5: 0,
        },
    },
    detected_issues: [
        {
            issue_type: 'three_putts',
            severity: 'high',
            evidence: { count: 4 },
            possible_causes: ['poor_lag_distance_control', 'green_speed_misjudgment'],
        },
    ],
});

const makeConversationState = (): ConversationState => ({
    current_focus: 'three_putts',
    question_count_for_issue: 1,
    asked_question_ids: ['putt_leave_pattern'],
    facts_learned: { 'putting.first_putt_pattern': 'mostly_short' },
    answers: [
        {
            question_id: 'putt_leave_pattern',
            question_text: 'On your 3-putts, did your first putt usually finish short, well past, or mixed?',
            answer: { option_id: 'mostly_short', label: 'Mostly short' },
        },
    ],
});

const mockFetchResponse = (body: object, ok = true, status = 200) => {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        status,
        json: jest.fn().mockResolvedValue(body),
    });
};

const wrapInOpenAiResponse = (content: object) => ({
    choices: [{ message: { content: JSON.stringify(content) } }],
});

const ASK_QUESTION_RESPONSE = {
    status: 'ask_question',
    focus_issue: 'three_putts',
    reasoning_summary: 'First putt left short — testing pace control vs read.',
    question: {
        id: 'pace_short_cause',
        text: 'When your first putt finished short, was it mainly a pace issue or a misread?',
        type: 'single_choice',
        options: [
            { id: 'pace', label: 'Pace — hit it too softly' },
            { id: 'misread', label: 'Misread — thought it was shorter' },
        ],
    },
    expected_signal: 'Distinguishes pace-control from green-reading root cause.',
    state_patch: { current_focus: 'three_putts', question_count_for_issue: 2 },
};

const GIVE_COACHING_RESPONSE = {
    status: 'give_coaching',
    focus_issue: 'three_putts',
    reasoning_summary: 'Evidence points to poor lag distance control.',
    diagnosis: {
        primary_cause: 'poor_lag_distance_control',
        confidence: 0.8,
        supporting_facts: ['4 three_putts', 'first putts consistently short'],
    },
    coaching: {
        summary: 'Work on lag putting to leave the ball within 3 feet consistently.',
        actions: ['Practice 30-foot lag putts', 'Focus on pace over line', 'Develop pre-putt distance routine'],
        drill_suggestions: ['Clock drill at 30 feet', 'Ladder drill'],
    },
    state_patch: { current_focus: null, issue_completed: true },
};

describe('callAiCoach', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('successful responses', () => {
        it('returns AskQuestionResponse when AI returns ask_question status', async () => {
            mockFetchResponse(wrapInOpenAiResponse(ASK_QUESTION_RESPONSE));

            const result = await callAiCoach('test-key', makePayload(), makeConversationState());

            expect(result.status).toBe('ask_question');
            expect(result.focus_issue).toBe('three_putts');
        });

        it('returns full ask_question shape including question and state_patch', async () => {
            mockFetchResponse(wrapInOpenAiResponse(ASK_QUESTION_RESPONSE));

            const result = await callAiCoach('test-key', makePayload(), makeConversationState());

            if (result.status !== 'ask_question') throw new Error('expected ask_question');
            expect(result.question.id).toBe('pace_short_cause');
            expect(result.question.type).toBe('single_choice');
            expect(result.question.options).toHaveLength(2);
            expect(result.state_patch.question_count_for_issue).toBe(2);
        });

        it('returns GiveCoachingResponse when AI returns give_coaching status', async () => {
            mockFetchResponse(wrapInOpenAiResponse(GIVE_COACHING_RESPONSE));

            const result = await callAiCoach('test-key', makePayload(), makeConversationState());

            expect(result.status).toBe('give_coaching');
        });

        it('returns full give_coaching shape including diagnosis and coaching', async () => {
            mockFetchResponse(wrapInOpenAiResponse(GIVE_COACHING_RESPONSE));

            const result = await callAiCoach('test-key', makePayload(), makeConversationState());

            if (result.status !== 'give_coaching') throw new Error('expected give_coaching');
            expect(result.diagnosis.primary_cause).toBe('poor_lag_distance_control');
            expect(result.diagnosis.confidence).toBe(0.8);
            expect(result.coaching.actions).toHaveLength(3);
            expect(result.coaching.drill_suggestions).toHaveLength(2);
            expect(result.state_patch.issue_completed).toBe(true);
        });
    });

    describe('request structure', () => {
        it('sends POST to OpenAI chat completions endpoint', async () => {
            mockFetchResponse(wrapInOpenAiResponse(ASK_QUESTION_RESPONSE));

            await callAiCoach('test-key', makePayload(), makeConversationState());

            const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(url).toBe('https://api.openai.com/v1/chat/completions');
            expect(options.method).toBe('POST');
        });

        it('sends Authorization header with provided API key', async () => {
            mockFetchResponse(wrapInOpenAiResponse(ASK_QUESTION_RESPONSE));

            await callAiCoach('sk-secret-key', makePayload(), makeConversationState());

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(options.headers['Authorization']).toBe('Bearer sk-secret-key');
        });

        it('sends Content-Type application/json header', async () => {
            mockFetchResponse(wrapInOpenAiResponse(ASK_QUESTION_RESPONSE));

            await callAiCoach('test-key', makePayload(), makeConversationState());

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(options.headers['Content-Type']).toBe('application/json');
        });

        it('includes payload and conversation_state in user message body', async () => {
            mockFetchResponse(wrapInOpenAiResponse(ASK_QUESTION_RESPONSE));
            const payload = makePayload();
            const state = makeConversationState();

            await callAiCoach('test-key', payload, state);

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(options.body);
            const userMessage = body.messages.find((m: { role: string }) => m.role === 'user');
            const userContent = JSON.parse(userMessage.content);
            expect(userContent.round.round_id).toBe('r_5');
            expect(userContent.conversation_state.current_focus).toBe('three_putts');
        });

        it('includes a system message in the request', async () => {
            mockFetchResponse(wrapInOpenAiResponse(ASK_QUESTION_RESPONSE));

            await callAiCoach('test-key', makePayload(), makeConversationState());

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(options.body);
            const systemMessage = body.messages.find((m: { role: string }) => m.role === 'system');
            expect(systemMessage).toBeDefined();
            expect(typeof systemMessage.content).toBe('string');
            expect(systemMessage.content.length).toBeGreaterThan(0);
        });
    });

    describe('error handling', () => {
        it('throws when API returns non-200 status', async () => {
            mockFetchResponse({}, false, 401);

            await expect(callAiCoach('bad-key', makePayload(), makeConversationState()))
                .rejects.toThrow('401');
        });

        it('throws when API returns 500 status', async () => {
            mockFetchResponse({}, false, 500);

            await expect(callAiCoach('test-key', makePayload(), makeConversationState()))
                .rejects.toThrow('500');
        });

        it('throws when response content is not valid JSON', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: 'not json at all' } }],
                }),
            });

            await expect(callAiCoach('test-key', makePayload(), makeConversationState()))
                .rejects.toThrow();
        });

        it('throws when response has unknown status field', async () => {
            mockFetchResponse(wrapInOpenAiResponse({ status: 'unknown_status', foo: 'bar' }));

            await expect(callAiCoach('test-key', makePayload(), makeConversationState()))
                .rejects.toThrow();
        });
    });
});
