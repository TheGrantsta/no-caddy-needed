import { StyleSheet, Text, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { GiveCoachingResponse } from '@/service/AnalysisService';

type Props = {
    response: GiveCoachingResponse;
};

const DrillRecommendation = ({ response }: Props) => {
    const colours = useThemeColours();

    const s = StyleSheet.create({
        container: { padding: 16 },
        section: { marginBottom: 20 },
        sectionHeader: { color: colours.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
        summary: { color: colours.text, fontSize: 16, lineHeight: 22 },
        primaryCause: { color: colours.primary, fontSize: 15, fontWeight: '600' },
        listItem: { color: colours.text, fontSize: 15, lineHeight: 22, marginBottom: 4 },
        factItem: { color: colours.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 2 },
    });

    return (
        <View style={s.container}>
            <View style={s.section}>
                <Text style={s.sectionHeader}>Coaching</Text>
                <Text testID="drill-rec-summary" style={s.summary}>
                    {response.coaching.summary}
                </Text>
            </View>

            <View style={s.section}>
                <Text style={s.sectionHeader}>Root Cause</Text>
                <Text testID="drill-rec-primary-cause" style={s.primaryCause}>
                    {response.diagnosis.primary_cause}
                </Text>
                {response.diagnosis.supporting_facts.map((fact, i) => (
                    <Text key={i} testID={`drill-rec-supporting-fact-${i}`} style={s.factItem}>
                        {fact}
                    </Text>
                ))}
            </View>

            {response.coaching.actions.length > 0 && (
                <View style={s.section}>
                    <Text style={s.sectionHeader}>Actions</Text>
                    {response.coaching.actions.map((action, i) => (
                        <Text key={i} testID={`drill-rec-action-${i}`} style={s.listItem}>
                            {action}
                        </Text>
                    ))}
                </View>
            )}

            {response.coaching.drill_suggestions.length > 0 && (
                <View style={s.section}>
                    <Text style={s.sectionHeader}>Drills</Text>
                    {response.coaching.drill_suggestions.map((drill, i) => (
                        <Text key={i} testID={`drill-rec-drill-${i}`} style={s.listItem}>
                            {drill}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
};

export default DrillRecommendation;
