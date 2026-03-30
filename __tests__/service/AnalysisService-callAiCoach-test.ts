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
        text: jest.fn().mockResolvedValue(''),
        json: jest.fn().mockResolvedValue(body),
    });
};

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
    beforeEach(() => {
        jest.useFakeTimers();
        process.env.EXPO_PUBLIC_AI_PROXY_URL = 'https://test-proxy.example.com';
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        delete process.env.EXPO_PUBLIC_AI_PROXY_URL;
        delete process.env.EXPO_PUBLIC_APP_SECRET;
    });

    describe('successful responses', () => {
        it('returns AskQuestionResponse when AI returns ask_question status', async () => {
            mockFetchResponse(ASK_QUESTION_RESPONSE);

            const result = await callAiCoach(makePayload(), makeConversationState());

            expect(result.status).toBe('ask_question');
            expect(result.focus_issue).toBe('three_putts');
        });

        it('returns full ask_question shape including question and state_patch', async () => {
            mockFetchResponse(ASK_QUESTION_RESPONSE);

            const result = await callAiCoach(makePayload(), makeConversationState());

            if (result.status !== 'ask_question') throw new Error('expected ask_question');
            expect(result.question.id).toBe('pace_short_cause');
            expect(result.question.type).toBe('single_choice');
            expect(result.question.options).toHaveLength(2);
            expect(result.state_patch.question_count_for_issue).toBe(2);
        });

        it('returns GiveCoachingResponse when AI returns give_coaching status', async () => {
            mockFetchResponse(GIVE_COACHING_RESPONSE);

            const result = await callAiCoach(makePayload(), makeConversationState());

            expect(result.status).toBe('give_coaching');
        });

        it('returns full give_coaching shape including diagnosis and coaching', async () => {
            mockFetchResponse(GIVE_COACHING_RESPONSE);

            const result = await callAiCoach(makePayload(), makeConversationState());

            if (result.status !== 'give_coaching') throw new Error('expected give_coaching');
            expect(result.diagnosis.primary_cause).toBe('poor_lag_distance_control');
            expect(result.diagnosis.confidence).toBe(0.8);
            expect(result.coaching.actions).toHaveLength(3);
            expect(result.coaching.drill_suggestions).toHaveLength(2);
            expect(result.state_patch.issue_completed).toBe(true);
        });
    });

    describe('request structure', () => {
        it('sends POST to proxy URL from EXPO_PUBLIC_AI_PROXY_URL env var', async () => {
            mockFetchResponse(ASK_QUESTION_RESPONSE);

            await callAiCoach(makePayload(), makeConversationState());

            const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(url).toBe('https://test-proxy.example.com/coach');
            expect(options.method).toBe('POST');
        });

        it('does not send Authorization header', async () => {
            mockFetchResponse(ASK_QUESTION_RESPONSE);

            await callAiCoach(makePayload(), makeConversationState());

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(options.headers['Authorization']).toBeUndefined();
        });

        it('sends Content-Type application/json header', async () => {
            mockFetchResponse(ASK_QUESTION_RESPONSE);

            await callAiCoach(makePayload(), makeConversationState());

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(options.headers['Content-Type']).toBe('application/json');
        });

        it('sends payload and conversationState as POST body', async () => {
            mockFetchResponse(ASK_QUESTION_RESPONSE);
            const payload = makePayload();
            const state = makeConversationState();

            await callAiCoach(payload, state);

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(options.body);
            expect(body.payload.round.round_id).toBe('r_5');
            expect(body.conversationState.current_focus).toBe('three_putts');
        });

        it('sends X-App-Secret header when EXPO_PUBLIC_APP_SECRET set', async () => {
            process.env.EXPO_PUBLIC_APP_SECRET = 'my-secret';
            mockFetchResponse(ASK_QUESTION_RESPONSE);

            await callAiCoach(makePayload(), makeConversationState());

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(options.headers['X-App-Secret']).toBe('my-secret');
        });

        it('omits X-App-Secret header when EXPO_PUBLIC_APP_SECRET not set', async () => {
            mockFetchResponse(ASK_QUESTION_RESPONSE);

            await callAiCoach(makePayload(), makeConversationState());

            const [, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(options.headers['X-App-Secret']).toBeUndefined();
        });
    });

    describe('error handling', () => {
        it('throws when API returns non-200 status', async () => {
            mockFetchResponse({}, false, 401);

            const promise = callAiCoach(makePayload(), makeConversationState());
            const assertion = expect(promise).rejects.toThrow('401');
            await jest.runAllTimersAsync();
            await assertion;
        });

        it('throws when API returns 500 status', async () => {
            mockFetchResponse({}, false, 500);

            const promise = callAiCoach(makePayload(), makeConversationState());
            const assertion = expect(promise).rejects.toThrow('500');
            await jest.runAllTimersAsync();
            await assertion;
        });

        it('throws when response content is not valid JSON', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                text: jest.fn().mockResolvedValue(''),
                json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
            });

            const promise = callAiCoach(makePayload(), makeConversationState());
            const assertion = expect(promise).rejects.toThrow();
            await jest.runAllTimersAsync();
            await assertion;
        });

        it('throws when response has unknown status field', async () => {
            mockFetchResponse({ status: 'unknown_status', foo: 'bar' });

            const promise = callAiCoach(makePayload(), makeConversationState());
            const assertion = expect(promise).rejects.toThrow();
            await jest.runAllTimersAsync();
            await assertion;
        });
    });

    describe('retry behaviour', () => {
        it('throws immediately with rate limit message for 429', async () => {
            mockFetchResponse({}, false, 429);

            await expect(callAiCoach(makePayload(), makeConversationState()))
                .rejects.toThrow('Sorry this service is unavailable at the moment');
        });

        it('does not retry on 429', async () => {
            mockFetchResponse({}, false, 429);

            await expect(callAiCoach(makePayload(), makeConversationState()))
                .rejects.toThrow();

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('retries 3 times before throwing on persistent non-429 error', async () => {
            mockFetchResponse({}, false, 500);

            const promise = callAiCoach(makePayload(), makeConversationState());
            const assertion = expect(promise).rejects.toThrow();
            await jest.runAllTimersAsync();
            await assertion;

            expect(global.fetch).toHaveBeenCalledTimes(4);
        });

        it('waits 1s, 2s, 4s between retries', async () => {
            mockFetchResponse({}, false, 500);
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

            const promise = callAiCoach(makePayload(), makeConversationState());
            const assertion = expect(promise).rejects.toThrow();
            await jest.runAllTimersAsync();
            await assertion;

            const delays = setTimeoutSpy.mock.calls.map(call => call[1]);
            expect(delays).toEqual([1000, 2000, 4000]);
        });

        it('returns successful response when a retry succeeds', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ ok: false, status: 500, text: jest.fn().mockResolvedValue('err') })
                .mockResolvedValue({ ok: true, status: 200, text: jest.fn().mockResolvedValue(''), json: jest.fn().mockResolvedValue(ASK_QUESTION_RESPONSE) });

            const promise = callAiCoach(makePayload(), makeConversationState());
            await jest.runAllTimersAsync();

            const result = await promise;
            expect(result.status).toBe('ask_question');
        });
    });
});
