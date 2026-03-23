import { StyleSheet, Text, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { GiveCoachingResponse } from '@/service/AnalysisService';
import fontSizes from '@/assets/font-sizes';

type Props = {
    response: GiveCoachingResponse;
};

const DrillRecommendation = ({ response }: Props) => {
    const colours = useThemeColours();
    const styles = useStyles();

    const s = StyleSheet.create({
        sectionLabel: {
            color: colours.primary,
            fontSize: fontSizes.subHeader,
            // fontWeight: '700',
            // textTransform: 'uppercase',
            // letterSpacing: 1,
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
    });

    return (
        <View>
            <View style={styles.contentSection}>
                <Text style={s.sectionLabel}>Coaching</Text>
                <Text testID="drill-rec-summary" style={styles.normalText}>
                    {response.coaching.summary}
                </Text>
            </View>

            {/* <View style={styles.contentSection}>
                <Text style={s.sectionLabel}>Root Cause</Text>
                <Text testID="drill-rec-primary-cause" style={s.primaryCause}>
                    {response.diagnosis.primary_cause}
                </Text>
                {response.diagnosis.supporting_facts.map((fact, i) => (
                    <Text key={i} testID={`drill-rec-supporting-fact-${i}`} style={s.factItem}>
                        {fact}
                    </Text>
                ))}
            </View> */}

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
        </View>
    );
};

export default DrillRecommendation;
