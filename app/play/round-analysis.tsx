import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import {
    buildRoundAnalysisPayload,
    callAiCoach,
    AiCoachResponse,
    AskQuestionResponse,
    ConversationState,
    RoundAnalysisPayload,
    Answer,
} from '../../service/AnalysisService';
import { AnswerValue } from '../../components/SinQuestion';
import SinQuestion from '../../components/SinQuestion';
import DrillRecommendation from '../../components/DrillRecommendation';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

const INITIAL_STATE: ConversationState = {
    current_focus: null,
    question_count_for_issue: 0,
    asked_question_ids: [],
    facts_learned: {},
    answers: [],
};

const toAnswerRecord = (value: AnswerValue): Answer['answer'] => {
    if (Array.isArray(value)) {
        return { value: value.map(v => v.label).join(', ') };
    }
    return value as Answer['answer'];
};

export default function RoundAnalysisScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { roundId } = useLocalSearchParams<{ roundId: string }>();

    const [payload, setPayload] = useState<RoundAnalysisPayload | null | undefined>(undefined);
    const [conversationState, setConversationState] = useState<ConversationState>(INITIAL_STATE);
    const [aiResponse, setAiResponse] = useState<AiCoachResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const p = buildRoundAnalysisPayload(Number(roundId));
        setPayload(p);
    }, [roundId]);

    useEffect(() => {
        if (payload === undefined) return;
        if (payload === null) return;
        callCoach(payload, INITIAL_STATE);
    }, [payload]);

    const callCoach = async (p: RoundAnalysisPayload, state: ConversationState) => {
        setLoading(true);
        setError(false);
        try {
            const response = await callAiCoach(API_KEY, p, state);
            setAiResponse(response);
        } catch (e) {
            console.error('[RoundAnalysis] callAiCoach failed:', e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (value: AnswerValue) => {
        if (!aiResponse || aiResponse.status !== 'ask_question') return;
        const question = (aiResponse as AskQuestionResponse).question;
        const patch = (aiResponse as AskQuestionResponse).state_patch;

        const newAnswer: Answer = {
            question_id: question.id,
            question_text: question.text,
            answer: toAnswerRecord(value),
        };

        const newState: ConversationState = {
            current_focus: patch.current_focus,
            question_count_for_issue: patch.question_count_for_issue,
            asked_question_ids: [...conversationState.asked_question_ids, question.id],
            facts_learned: conversationState.facts_learned,
            answers: [...conversationState.answers, newAnswer],
        };

        setConversationState(newState);
        callCoach(payload!, newState);
    };

    if (payload === null || error) {
        return (
            <GestureHandlerRootView style={styles.flexOne}>
                <View style={[styles.container, styles.headerContainer]}>
                    <Text testID="round-analysis-error" style={styles.headerText}>
                        {payload === null ? 'Round not found' : 'Something went wrong. Please try again.'}
                    </Text>
                </View>
            </GestureHandlerRootView>
        );
    }

    if (loading || payload === undefined) {
        return (
            <GestureHandlerRootView style={styles.flexOne}>
                <View style={[styles.container, styles.headerContainer]}>
                    <ActivityIndicator testID="round-analysis-loading" size="large" color={colours.primary} />
                </View>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Round analysis</Text>
                </View>

                {aiResponse?.status === 'ask_question' && (
                    <SinQuestion question={aiResponse.question} onAnswer={handleAnswer} />
                )}

                {aiResponse?.status === 'give_coaching' && (
                    <DrillRecommendation response={aiResponse} />
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}
