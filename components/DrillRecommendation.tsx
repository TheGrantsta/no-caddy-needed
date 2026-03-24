import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { GiveCoachingResponse } from '@/service/AnalysisService';
import { FeedbackType } from '@/service/FirebaseService';
import fontSizes from '@/assets/font-sizes';

type Props = {
    response: GiveCoachingResponse;
    onFeedback?: (type: FeedbackType) => void;
    feedbackSubmitted?: boolean;
};

const DrillRecommendation = ({ response, onFeedback, feedbackSubmitted }: Props) => {
    const colours = useThemeColours();
    const styles = useStyles();

    const s = StyleSheet.create({
        sectionLabel: {
            color: colours.primary,
            fontSize: fontSizes.subHeader,
            marginBottom: 8,
        },
        primaryCause: {
            color: colours.primary,
            fontSize: 17,
            fontWeight: '600',
            marginBottom: 4,
        },
        factItem: {
            color: colours.tertiary,
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 2,
        },
        listItem: {
            fontSize: 17,
            lineHeight: 24,
            marginBottom: 4,
        },
        feedbackRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 24,
            marginTop: 16,
        },
        feedbackButton: {
            padding: 8,
        },
        thanksText: {
            textAlign: 'center',
            marginTop: 8,
            color: colours.tertiary,
        },
    });

    return (
        <View>
            <View style={styles.contentSection}>
                <Text style={s.sectionLabel}>Coaching</Text>
                <Text testID="drill-rec-summary" style={styles.normalText}>
                    {response.coaching.summary}
                </Text>
            </View>

            {response.coaching.actions.length > 0 && (
                <View style={styles.contentSection}>
                    <Text style={s.sectionLabel}>Actions</Text>
                    {response.coaching.actions.map((action, i) => (
                        <Text key={i} testID={`drill-rec-action-${i}`} style={[styles.smallText, s.listItem]}>
                            {action}
                        </Text>
                    ))}
                </View>
            )}

            {response.coaching.drill_suggestions.length > 0 && (
                <View style={styles.contentSection}>
                    <Text style={s.sectionLabel}>Drills</Text>
                    {response.coaching.drill_suggestions.map((drill, i) => (
                        <Text key={i} testID={`drill-rec-drill-${i}`} style={[styles.smallText, s.listItem]}>
                            {drill}
                        </Text>
                    ))}
                </View>
            )}

            {onFeedback && (
                <View>
                    <View style={styles.contentSection}>
                        <Text style={styles.normalText}>
                            Was this recommendation helpful?
                        </Text>
                        <View style={s.feedbackRow}>
                            <TouchableOpacity
                                testID="feedback-positive"
                                style={s.feedbackButton}
                                onPress={() => onFeedback('positive')}
                                disabled={feedbackSubmitted}
                            >
                                <MaterialIcons
                                    name="thumb-up"
                                    size={28}
                                    color={feedbackSubmitted ? colours.tertiary : colours.primary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="feedback-neutral"
                                style={s.feedbackButton}
                                onPress={() => onFeedback('neutral')}
                                disabled={feedbackSubmitted}
                            >
                                <MaterialIcons
                                    name="thumbs-up-down"
                                    size={28}
                                    color={feedbackSubmitted ? colours.tertiary : colours.primary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="feedback-negative"
                                style={s.feedbackButton}
                                onPress={() => onFeedback('negative')}
                                disabled={feedbackSubmitted}
                            >
                                <MaterialIcons
                                    name="thumb-down"
                                    size={28}
                                    color={feedbackSubmitted ? colours.tertiary : colours.primary}
                                />
                            </TouchableOpacity>
                        </View>
                        {feedbackSubmitted && (
                            <Text testID="feedback-thanks" style={s.thanksText}>
                                Thanks for your feedback!
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

export default DrillRecommendation;
