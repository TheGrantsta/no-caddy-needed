import React from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { Round, ParAverages } from '../service/DbService';
import { HOLES_PER_ROUND } from '@/utils/holeOrder';

// Each round row is at least this tall, so the list shows exactly this many rounds before it scrolls
const ROW_HEIGHT = 48;
const VISIBLE_ROUNDS = 10;

interface Props {
    rounds: Round[];
    parAverages: ParAverages;
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

export default function RoundHistorySection({ rounds, parAverages, fadeAnim, slideAnim }: Props) {
    const router = useRouter();
    const styles = useStyles();
    const colours = useThemeColours();
    const localStyles = styles.playScreen;

    if (rounds.length === 0) {
        return null;
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View testID="par-averages-card" style={[styles.deadlySinsChart.card, { padding: 16 }]}>
            <View testID="par-averages-container">
                <Text style={styles.parAverages.heading}>Average score by par</Text>
                <View style={styles.parAverages.row}>
                    {([3, 4, 5] as const).map(par => {
                        const val = parAverages[`par${par}` as keyof ParAverages];
                        return (
                            <View key={par} style={styles.parAverages.cell}>
                                <Text testID={`par-averages-par${par}`} style={styles.parAverages.value}>
                                    Par {par}: {val !== null ? val.toFixed(2) : '-'}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
            </View>

            <View testID="round-history-card" style={[styles.deadlySinsChart.card, { padding: 16 }]}>
                <Text style={[styles.subHeaderText, { padding: 0 }]}>Round history</Text>
                <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colours.primary }]}>
                    <Text testID="round-history-header-date" style={[styles.smallTextNoPadding, localStyles.historyDateColumn]}>Date</Text>
                    <Text testID="round-history-header-course" style={[styles.smallTextNoPadding, localStyles.historyCourseColumn]}>Course</Text>
                    <Text testID="round-history-header-strokes" style={[styles.smallTextNoPadding, localStyles.historyTotalColumn]}>Score</Text>
                </View>
                <ScrollView testID="round-history-scroll" style={{ maxHeight: ROW_HEIGHT * VISIBLE_ROUNDS }} nestedScrollEnabled>
                    {rounds.map((round) => (
                        <TouchableOpacity
                            key={round.Id}
                            testID={`round-history-row-${round.Id}`}
                            onPress={() => router.push({ pathname: '/play/scorecard', params: { roundId: String(round.Id) } })}
                            style={{ minHeight: ROW_HEIGHT, justifyContent: 'center' }}
                        >
                            <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colours.primary }]}>
                                <Text testID={`round-history-date-${round.Id}`} style={[styles.smallTextNoPadding, localStyles.historyDateColumn]}>
                                    {round.Created_At}
                                </Text>
                                <Text style={[styles.smallTextNoPadding, localStyles.historyCourseColumn]}>
                                    {[round.CourseName, round.HolesPlayed < HOLES_PER_ROUND ? `(${round.HolesPlayed})` : null].filter(Boolean).join(' ')}
                                </Text>
                                <View style={[styles.row, localStyles.historyTotalColumn]}>
                                    <Text testID={`round-history-strokes-${round.Id}`} style={[styles.smallTextNoPadding, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
                                        {round.StrokeTotal !== null && round.StrokeTotal !== undefined ? String(round.StrokeTotal) : '-'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Animated.View>
    );
}
