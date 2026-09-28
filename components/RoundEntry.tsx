import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CtaButton from './CtaButton';
import PlayerSetup from './PlayerSetup';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { Round, ParAverages } from '../service/DbService';

interface Props {
    roundHistory: Round[];
    historyFilter: 1 | 10 | 'all';
    onHistoryFilterChange: (filter: 1 | 10 | 'all') => void;
    incompleteRound: { Id: number; CourseName?: string } | null;
    notificationId: string | null;
    showPlayerSetup: boolean;
    onShowPlayerSetup: () => void;
    onContinueRound: () => Promise<void>;
    onEndIncompleteRound: () => Promise<void>;
    recentCourseNames: string[];
    recentPlayerNames: string[];
    onStartRound: (playerNames: string[], courseName: string) => Promise<void>;
    onRemoveCourse: (name: string) => void;
    onRemovePlayer: (name: string) => void;
    parAverages: ParAverages;
    onShowOnboarding: () => void;
    showOnboarding: boolean;
}

export default function RoundEntry({
    roundHistory,
    historyFilter,
    onHistoryFilterChange,
    incompleteRound,
    notificationId,
    showPlayerSetup,
    onShowPlayerSetup,
    onContinueRound,
    onEndIncompleteRound,
    recentCourseNames,
    recentPlayerNames,
    onStartRound,
    onRemoveCourse,
    onRemovePlayer,
    parAverages,
    onShowOnboarding,
}: Props) {
    const router = useRouter();
    const styles = useStyles();
    const colours = useThemeColours();

    const filteredRoundHistory = useMemo(
        () => historyFilter === 'all' ? roundHistory : roundHistory.slice(0, historyFilter),
        [historyFilter, roundHistory]
    );

    const localStyles = styles.playScreen;

    if (showPlayerSetup) {
        return (
            <View style={styles.container}>
                <PlayerSetup
                    onStartRound={onStartRound}
                    onCancel={() => { /* handled by parent */ }}
                    recentCourseNames={recentCourseNames}
                    recentPlayerNames={recentPlayerNames}
                    onRemoveCourse={onRemoveCourse}
                    onRemovePlayer={onRemovePlayer}
                />
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <TouchableOpacity
                            testID="play-onboarding-info-button"
                            onPress={onShowOnboarding}
                            style={{ padding: 4 }}
                        >
                            <MaterialIcons name="info-outline" size={24} color={colours.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerText, styles.marginTop]}>Play</Text>
                    </View>

                    {incompleteRound ? (
                        <Text style={[styles.normalText, styles.marginBottom]}>
                            Continue or end previously started round that was not completed
                        </Text>
                    ) : (
                        <Text style={[styles.normalText, styles.marginBottom]}>
                            Start a round (score-only or stats), review past rounds & edit scores
                        </Text>
                    )}
                </View>

                {incompleteRound ? (
                    <>
                        <CtaButton
                            testID="continue-round-button"
                            label="Continue round"
                            icon="play-circle-outline"
                            onPress={onContinueRound}
                            style={styles.marginTop}
                        />
                        <TouchableOpacity
                            testID="end-incomplete-round-link"
                            onPress={onEndIncompleteRound}
                            style={{ padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}
                        >
                            <Text style={localStyles.endRoundLink}>End round</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <CtaButton
                        testID="start-round-button"
                        label="Start round"
                        icon="play-arrow"
                        onPress={onShowPlayerSetup}
                        style={styles.marginTop}
                    />
                )}

                {!incompleteRound && roundHistory.length > 0 && (
                    <View style={localStyles.filterContainer}>
                        <Text testID="filter-label" style={localStyles.filterLabel}>Show</Text>
                        {([1, 10, 'all'] as const).map(f => (
                            <TouchableOpacity
                                key={String(f)}
                                testID={`filter-button-${f}`}
                                onPress={() => onHistoryFilterChange(f)}
                                style={[localStyles.filterButton, historyFilter === f && localStyles.filterButtonSelected]}
                            >
                                <Text style={[localStyles.filterButtonText, historyFilter === f && localStyles.filterButtonTextSelected]}>
                                    {f === 'all' ? 'All' : String(f)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {!incompleteRound && roundHistory.length > 0 && (
                    <View testID="par-averages-container" style={styles.parAverages.container}>
                        <Text style={styles.parAverages.heading}>Average score by par</Text>
                        <View style={styles.parAverages.row}>
                            {([3, 4, 5] as const).map(par => {
                                const val = parAverages[`par${par}` as keyof ParAverages];
                                return (
                                    <View key={par} style={styles.parAverages.cell}>
                                        <Text
                                            testID={`par-averages-par${par}`}
                                            style={styles.parAverages.value}
                                        >
                                            Par {par}: {val !== null ? val.toFixed(2) : '-'}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {!incompleteRound && roundHistory.length > 0 && (
                    <View style={{ padding: 5 }}>
                        <Text style={styles.subHeaderText}>Round history</Text>
                        <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colours.primary }]}>
                            <Text testID="round-history-header-date" style={[styles.smallText, localStyles.historyDateColumn]}>Date Course</Text>
                            <Text testID="round-history-header-strokes" style={[styles.smallText, localStyles.historyTotalColumn, { textAlign: 'left' }]}>Score</Text>
                        </View>
                        <ScrollView testID="round-history-scroll" style={localStyles.roundHistoryScroll} nestedScrollEnabled>
                            {filteredRoundHistory.map((round) => (
                                <TouchableOpacity
                                    key={round.Id}
                                    testID={`round-history-row-${round.Id}`}
                                    onPress={() => router.push({ pathname: '/play/scorecard', params: { roundId: String(round.Id) } })}
                                >
                                    <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colours.primary }]}>
                                        <Text style={[styles.smallTextNoPadding, localStyles.historyDateColumn]}>
                                            {round.CourseName ? `${round.Created_At} ${round.CourseName}` : round.Created_At}
                                            {round.HolesPlayed < 18 ? ` (${round.HolesPlayed})` : ''}
                                        </Text>
                                        <View style={[styles.row, localStyles.historyTotalColumn]}>
                                            <Text testID={`round-history-strokes-${round.Id}`} style={styles.smallTextNoPadding}>
                                                {round.StrokeTotal !== null && round.StrokeTotal !== undefined ? String(round.StrokeTotal) : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
