import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import RoundAnalysisScreen from '../../../app/play/round-analysis';
import { buildRoundAnalysisPayload, callAiCoach } from '../../../service/AnalysisService';

jest.mock('../../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useStyles', () => ({
    useStyles: () => require('../../../assets/styles').default,
}));

jest.mock('../../../service/AnalysisService', () => ({
    buildRoundAnalysisPayload: jest.fn(),
    callAiCoach: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
    const GestureHandler = jest.requireActual('react-native-gesture-handler');
    return {
        ...GestureHandler,
        GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    };
});

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ roundId: '5' }),
    useRouter: () => ({ back: jest.fn() }),
}));

const mockBuildPayload = buildRoundAnalysisPayload as jest.Mock;
const mockCallAiCoach = callAiCoach as jest.Mock;

const PAYLOAD = {
    round: {
        round_id: 'r_5',
        score: 89,
        course_par: 72,
        holes: [{ hole: 1, par: 4, score: 5 }],
        deadly_sins: { three_putts: 4, double_bogeys: 0, trouble_off_tee: 0, penalties: 0, double_chips: 0, bogeys_inside_9iron: 0, bogeys_par_5: 0 },
    },
    detected_issues: [{ issue_type: 'three_putts', severity: 'high', evidence: { count: 4 }, possible_causes: ['poor_lag'] }],
};

const ASK_QUESTION_RESPONSE = {
    status: 'ask_question',
    focus_issue: 'three_putts',
    reasoning_summary: 'Determining lag control vs misread.',
    question: {
        id: 'putt_leave_pattern',
        text: 'On your 3-putts, did your first putt usually finish short, well past, or mixed?',
        type: 'single_choice',
        options: [
            { id: 'mostly_short', label: 'Mostly short' },
            { id: 'well_past', label: 'Well past' },
            { id: 'mixed', label: 'Mixed' },
        ],
    },
    expected_signal: 'Separates pace from read issues.',
    state_patch: { current_focus: 'three_putts', question_count_for_issue: 1 },
};

const GIVE_COACHING_RESPONSE = {
    status: 'give_coaching',
    focus_issue: 'three_putts',
    reasoning_summary: 'Evidence points to poor lag control.',
    diagnosis: { primary_cause: 'poor_lag_distance_control', confidence: 0.8, supporting_facts: ['4 three-putts'] },
    coaching: { summary: 'Work on lag putting.', actions: ['Practice 30-foot putts'], drill_suggestions: ['Clock drill'] },
    state_patch: { current_focus: null, issue_completed: true },
};

describe('RoundAnalysisScreen', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockBuildPayload.mockReturnValue(PAYLOAD);
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('loading state', () => {
        it('shows loading indicator while AI call is in progress', async () => {
            mockCallAiCoach.mockReturnValue(new Promise(() => {})); // never resolves

            const { getByTestId } = render(<RoundAnalysisScreen />);

            expect(getByTestId('round-analysis-loading')).toBeTruthy();
        });

        it('shows thinking text while AI call is in progress', async () => {
            mockCallAiCoach.mockReturnValue(new Promise(() => {})); // never resolves

            const { getByTestId } = render(<RoundAnalysisScreen />);

            expect(getByTestId('round-analysis-thinking-text')).toBeTruthy();
        });

        it('hides loading indicator once AI responds', async () => {
            mockCallAiCoach.mockResolvedValue(ASK_QUESTION_RESPONSE);

            const { queryByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => expect(queryByTestId('round-analysis-loading')).toBeNull());
        });
    });

    describe('error states', () => {
        it('shows error when payload is null (round not found)', async () => {
            mockBuildPayload.mockReturnValue(null);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            expect(getByTestId('round-analysis-error')).toBeTruthy();
        });

        it('does not call AI when payload is null', () => {
            mockBuildPayload.mockReturnValue(null);

            render(<RoundAnalysisScreen />);

            expect(mockCallAiCoach).not.toHaveBeenCalled();
        });

        it('shows error when AI call throws', async () => {
            mockCallAiCoach.mockRejectedValue(new Error('Network error'));

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => expect(getByTestId('round-analysis-error')).toBeTruthy());
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('ask_question flow', () => {
        it('renders SinQuestion with question text when AI returns ask_question', async () => {
            mockCallAiCoach.mockResolvedValue(ASK_QUESTION_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() =>
                expect(getByTestId('sin-question-text').props.children).toBe(
                    'On your 3-putts, did your first putt usually finish short, well past, or mixed?'
                )
            );
        });

        it('renders options for the question', async () => {
            mockCallAiCoach.mockResolvedValue(ASK_QUESTION_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => expect(getByTestId('sin-question-option-mostly_short')).toBeTruthy());
        });
    });

    describe('conversation loop', () => {
        it('calls callAiCoach again after user answers', async () => {
            mockCallAiCoach
                .mockResolvedValueOnce(ASK_QUESTION_RESPONSE)
                .mockResolvedValue(GIVE_COACHING_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => getByTestId('sin-question-option-mostly_short'));
            await act(async () => {
                fireEvent.press(getByTestId('sin-question-option-mostly_short'));
            });

            expect(mockCallAiCoach).toHaveBeenCalledTimes(2);
        });

        it('sends updated asked_question_ids in second call', async () => {
            mockCallAiCoach
                .mockResolvedValueOnce(ASK_QUESTION_RESPONSE)
                .mockResolvedValue(GIVE_COACHING_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => getByTestId('sin-question-option-mostly_short'));
            await act(async () => {
                fireEvent.press(getByTestId('sin-question-option-mostly_short'));
            });

            const secondCallState = mockCallAiCoach.mock.calls[1][2];
            expect(secondCallState.asked_question_ids).toContain('putt_leave_pattern');
        });

        it('sends updated answers array in second call', async () => {
            mockCallAiCoach
                .mockResolvedValueOnce(ASK_QUESTION_RESPONSE)
                .mockResolvedValue(GIVE_COACHING_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => getByTestId('sin-question-option-mostly_short'));
            await act(async () => {
                fireEvent.press(getByTestId('sin-question-option-mostly_short'));
            });

            const secondCallState = mockCallAiCoach.mock.calls[1][2];
            expect(secondCallState.answers).toHaveLength(1);
            expect(secondCallState.answers[0].question_id).toBe('putt_leave_pattern');
        });

        it('sends state_patch values in second call', async () => {
            mockCallAiCoach
                .mockResolvedValueOnce(ASK_QUESTION_RESPONSE)
                .mockResolvedValue(GIVE_COACHING_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => getByTestId('sin-question-option-mostly_short'));
            await act(async () => {
                fireEvent.press(getByTestId('sin-question-option-mostly_short'));
            });

            const secondCallState = mockCallAiCoach.mock.calls[1][2];
            expect(secondCallState.current_focus).toBe('three_putts');
            expect(secondCallState.question_count_for_issue).toBe(1);
        });

        it('shows loading while second AI call is in progress', async () => {
            mockCallAiCoach
                .mockResolvedValueOnce(ASK_QUESTION_RESPONSE)
                .mockReturnValue(new Promise(() => {}));

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => getByTestId('sin-question-option-mostly_short'));
            await act(async () => {
                fireEvent.press(getByTestId('sin-question-option-mostly_short'));
            });

            expect(getByTestId('round-analysis-loading')).toBeTruthy();
        });
    });

    describe('give_coaching flow', () => {
        it('renders DrillRecommendation when AI returns give_coaching', async () => {
            mockCallAiCoach.mockResolvedValue(GIVE_COACHING_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() => expect(getByTestId('drill-rec-summary')).toBeTruthy());
        });

        it('shows coaching summary text', async () => {
            mockCallAiCoach.mockResolvedValue(GIVE_COACHING_RESPONSE);

            const { getByTestId } = render(<RoundAnalysisScreen />);

            await waitFor(() =>
                expect(getByTestId('drill-rec-summary').props.children).toBe('Work on lag putting.')
            );
        });
    });
});
