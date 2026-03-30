import { useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import HoleScoreInput from '../../components/HoleScoreInput';
import DeadlySinsTally from '../../components/DeadlySinsTally';
import DeadlySinsChart from '../../components/DeadlySinsChart';
import SubMenu from '../../components/SubMenu';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import WedgeChartScreen from '../play/wedge-chart';
import PlayerSetup from '../../components/PlayerSetup';
import Scorecard from '../../components/Scorecard';
import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertHoleDeadlySinsService,
    getAllDeadlySinsRoundsService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    getHolesPlayedForRoundService,
    getSettingsService,
    saveSettingsService,
    getParAveragesService,
    Round,
    RoundPlayer,
    DeadlySinsRound,
    DeadlySinsValues,
    MultiplayerRoundScorecard,
    ParAverages,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder, cancelAllRoundReminders } from '../../service/NotificationService';
import { logEvent } from '../../service/FirebaseService';
import Constants from 'expo-constants';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import fontSizes from '../../assets/font-sizes';
import DistancesScreen from '../play/distances';

const ONBOARDING_STEPS = [
    { text: 'Start a round to track your scores hole by hole and see your running total.' },
    { text: 'Add playing partners, set the par for each hole, and record everyone\'s scores.' },
    { text: 'After your round, review your scorecard and track your 7 Deadly Sins stats over time.' },
];

const formatScore = (score: number): string => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return `${score}`;
};

export default function Play() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const [refreshing, setRefreshing] = useState(false);
    const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
    const [currentHole, setCurrentHole] = useState(1);
    const [holeContributions, setHoleContributions] = useState<Record<number, number>>({});
    const [roundHistory, setRoundHistory] = useState<Round[]>([]);
    const [deadlySinsRounds, setDeadlySinsRounds] = useState<DeadlySinsRound[]>([]);
    const [section, setSection] = useState('play-score');
    const INITIAL_SINS: DeadlySinsValues = { threePutts: false, doubleBogeys: false, bogeysPar5: false, bogeysInside9Iron: false, doubleChips: false, troubleOffTee: false, penalties: false };
    const [deadlySinsValues, setDeadlySinsValues] = useState<DeadlySinsValues>(INITIAL_SINS);
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [showPlayerSetup, setShowPlayerSetup] = useState(false);
    const [players, setPlayers] = useState<RoundPlayer[]>([]);
    const [currentHoleData, setCurrentHoleData] = useState<{ holeNumber: number; holePar: number; scores: { playerId: number; playerName: string; score: number }[] } | null>(null);
    const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false);
    const [scorecardData, setScorecardData] = useState<MultiplayerRoundScorecard | null>(null);
    const [recentCourseNames, setRecentCourseNames] = useState<string[]>([]);
    const [recentPlayerNames, setRecentPlayerNames] = useState<string[]>([]);
    const { showError, showResult } = useAppToast();
    const router = useRouter();
    const [settings, setSettings] = useState(getSettingsService());
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<1 | 10 | 'all'>('all');
    const [incompleteRound, setIncompleteRound] = useState<Round | null>(null);
    const scrollRef = useRef<ScrollView>(null);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const runningTotal = useMemo(
        () => Object.values(holeContributions).reduce((sum, c) => sum + c, 0),
        [holeContributions]
    );

    const localStyles = styles.playScreen;

    useEffect(() => {
        const activeRound = getActiveRoundService();
        if (activeRound) {
            setIncompleteRound(activeRound);
            const roundPlayers = getRoundPlayersService(activeRound.Id);
            if (roundPlayers.length > 0) {
                setPlayers(roundPlayers);
            }
        }
        const history = getAllRoundHistoryService();
        setRoundHistory(history);
        setDeadlySinsRounds(getAllDeadlySinsRoundsService());
        setRecentCourseNames(getRecentCourseNamesService());
        setRecentPlayerNames(getRecentPlayerNamesService());

        const currentSettings = getSettingsService();
        setSettings(currentSettings);
        if (!currentSettings.playOnboardingSeen && history.length === 0 && !activeRound) {
            setShowOnboarding(true);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        refreshTimerRef.current = setTimeout(() => {
            setRoundHistory(getAllRoundHistoryService());
            setDeadlySinsRounds(getAllDeadlySinsRoundsService());
            setRefreshing(false);
        }, 750);
    };

    useEffect(() => {
        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, []);

    const handleDismissOnboarding = async () => {
        setShowOnboarding(false);
        const updatedSettings = { ...settings, playOnboardingSeen: true };
        setSettings(updatedSettings);
        await saveSettingsService(updatedSettings);
    };

    const handleShowOnboarding = () => {
        setShowOnboarding(true);
    };

    const handleShowPlayerSetup = () => {
        setShowPlayerSetup(true);
    };

    const handleContinueRound = async () => {
        if (!incompleteRound) return;
        logEvent('continue_round');
        if (notificationId) {
            await cancelRoundReminder(notificationId);
        } else {
            await cancelAllRoundReminders();
        }
        const holesPlayed = getHolesPlayedForRoundService(incompleteRound.Id);
        setCurrentHole(holesPlayed > 0 ? holesPlayed + 1 : 1);
        setActiveRoundId(incompleteRound.Id);
        setIncompleteRound(null);
    };

    const handleEndIncompleteRound = async () => {
        if (!incompleteRound) return;
        await endRoundService(incompleteRound.Id);
        if (notificationId) {
            await cancelRoundReminder(notificationId);
        } else {
            await cancelAllRoundReminders();
        }
        setIncompleteRound(null);
        setPlayers([]);
        const history = getAllRoundHistoryService();
        setRoundHistory(history);
    };

    const handleStartRound = async (playerNames: string[], courseName: string) => {
        const roundId = await startRoundService(courseName);

        if (roundId) {
            logEvent('start_round');
            const playerIds = await addRoundPlayersService(roundId, playerNames);
            const roundPlayers = playerIds.map((id, index) => ({
                Id: id,
                RoundId: roundId,
                PlayerName: index === 0 ? 'You' : playerNames[index - 1],
                IsUser: index === 0 ? 1 : 0,
                SortOrder: index,
            }));

            setActiveRoundId(roundId);
            setPlayers(roundPlayers);
            setCurrentHole(1);
            setHoleContributions({});
            setShowPlayerSetup(false);
            const nId = await scheduleRoundReminder();
            setNotificationId(nId);
        } else {
            showError('Failed to start round');
        }
    };

    const handleScoresChange = (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => {
        setCurrentHoleData({ holeNumber, holePar, scores });
    };

    const buildDefaultHoleData = () => ({
        holeNumber: currentHole,
        holePar: 4,
        scores: players.map(p => ({ playerId: p.Id, playerName: p.PlayerName, score: 4 })),
    });

    const handlePreviousHole = () => {
        if (currentHole <= 1) return;
        const holeGoingBackTo = currentHole - 1;
        setHoleContributions(prev => {
            const next = { ...prev };
            delete next[holeGoingBackTo];
            return next;
        });
        setCurrentHole(prev => prev - 1);
        setCurrentHoleData(null);
    };

    const handleNextHole = async () => {
        if (!activeRoundId) return;

        const { holeNumber, holePar, scores } = currentHoleData || buildDefaultHoleData();
        const success = await addMultiplayerHoleScoresService(activeRoundId, holeNumber, holePar, scores);
        if (success) {
            await insertHoleDeadlySinsService(activeRoundId, holeNumber, deadlySinsValues);
            setDeadlySinsValues(INITIAL_SINS);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const userScore = scores.find(s => {
                const player = players.find(p => p.Id === s.playerId);
                return player && player.IsUser === 1;
            });
            const contribution = userScore ? userScore.score - holePar : 0;
            setHoleContributions(prev => ({ ...prev, [holeNumber]: contribution }));
            setCurrentHoleData(null);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            if (currentHole >= 18) {
                setShowEndRoundConfirm(true);
            } else {
                setCurrentHole(prev => prev + 1);
            }
        }
    };

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    const handledeadlySinsValuesChange = (values: DeadlySinsValues) => {
        setDeadlySinsValues(values);
    };

    const handleEndRoundPress = () => {
        setShowEndRoundConfirm(true);
    };

    const handleCancelEndRound = () => {
        setShowEndRoundConfirm(false);
    };

    const resetToIdle = () => {
        setActiveRoundId(null);
        setCurrentHole(1);
        setHoleContributions({});
        setSection('play-score');
        setDeadlySinsValues(INITIAL_SINS);
        setPlayers([]);
        setShowPlayerSetup(false);
        setCurrentHoleData(null);
        setShowEndRoundConfirm(false);
        setScorecardData(null);
        setRoundHistory(getAllRoundHistoryService());
        setDeadlySinsRounds(getAllDeadlySinsRoundsService());
        setRecentCourseNames(getRecentCourseNamesService());
        setRecentPlayerNames(getRecentPlayerNamesService());
    };

    const handleConfirmEndRound = async () => {
        if (!activeRoundId) return;

        logEvent('end_round');
        await cancelRoundReminder(notificationId);
        setNotificationId(null);

        const success = await endRoundService(activeRoundId);

        showResult(success, 'Round saved', 'Round not saved');

        const scorecard = getMultiplayerScorecardService(activeRoundId);
        if (scorecard) {
            setScorecardData(scorecard);
            setShowEndRoundConfirm(false);
        } else {
            resetToIdle();
        }
    };

    const handleScorecardDone = () => {
        resetToIdle();
    };

    const analyseRoundEnabled = Constants.expoConfig?.extra?.analyseRoundEnabled ?? false;
    const isRoundActive = activeRoundId !== null;

    const filteredRoundHistory = useMemo(
        () => historyFilter === 'all' ? roundHistory : roundHistory.slice(0, historyFilter),
        [roundHistory, historyFilter]
    );
    const parAverages = useMemo(
        () => getParAveragesService(filteredRoundHistory),
        [filteredRoundHistory]
    );
    const filteredRoundIds = useMemo(
        () => new Set(filteredRoundHistory.map(r => r.Id)),
        [filteredRoundHistory]
    );
    const filteredDeadlySinsRounds = useMemo(
        () => historyFilter === 'all'
            ? deadlySinsRounds
            : deadlySinsRounds.filter(r => r.RoundId != null && filteredRoundIds.has(r.RoundId as number)),
        [deadlySinsRounds, historyFilter, filteredRoundIds]
    );
    const deadlySinsMap = useMemo(
        () => new Map<number, number>(
            filteredDeadlySinsRounds
                .filter(t => t.RoundId != null)
                .map(t => [t.RoundId as number, t.Total])
        ),
        [filteredDeadlySinsRounds]
    );

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>Release to update</Text>
                </View>
            )}

            <ScrollView
                ref={scrollRef}
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colours.primary}
                    />
                }
            >

                <SubMenu showSubMenu="play" selectedItem={section} handleSubMenu={handleSubMenu} />

                {!isRoundActive && !showPlayerSetup && !scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <TouchableOpacity
                                    testID="play-onboarding-info-button"
                                    onPress={handleShowOnboarding}
                                    style={{ padding: 4 }}
                                >
                                    <MaterialIcons name="info-outline" size={24} color={colours.primary} />
                                </TouchableOpacity>
                                <Text style={[styles.headerText, styles.marginTop]}>Play</Text>
                            </View>

                            {incompleteRound ? (
                                <Text style={[styles.normalText, styles.marginBottom]}>
                                    Continue, or end round
                                </Text>
                            ) : (
                                <Text style={[styles.normalText, styles.marginBottom]}>
                                    Start round, review past rounds & 7 Deadly Sins stats
                                </Text>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {incompleteRound ? (
                            <>
                                <TouchableOpacity
                                    testID="continue-round-button"
                                    onPress={handleContinueRound}
                                    style={[localStyles.actionButton, styles.marginTop]}
                                >
                                    <Text style={localStyles.actionButtonText}>Continue round</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="end-incomplete-round-link"
                                    onPress={handleEndIncompleteRound}
                                    style={{ padding: 12, alignItems: 'center', marginTop: 4 }}
                                >
                                    <Text style={{ color: colours.red, fontSize: fontSizes.normal }}>End round</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                testID="start-round-button"
                                onPress={handleShowPlayerSetup}
                                style={[localStyles.actionButton, styles.marginTop]}
                            >
                                <Text style={localStyles.actionButtonText}>Start round</Text>
                            </TouchableOpacity>
                        )}


                        {!incompleteRound && roundHistory.length > 0 && (
                            <View style={localStyles.filterContainer}>
                                <Text testID="filter-label" style={localStyles.filterLabel}>Show</Text>
                                {([1, 10, 'all'] as const).map(f => (
                                    <TouchableOpacity
                                        key={String(f)}
                                        testID={`filter-button-${f}`}
                                        onPress={() => setHistoryFilter(f)}
                                        style={[localStyles.filterButton, historyFilter === f && localStyles.filterButtonSelected]}
                                    >
                                        <Text style={[localStyles.filterButtonText, historyFilter === f && localStyles.filterButtonTextSelected]}>
                                            {f === 'all' ? 'All' : String(f)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {!incompleteRound && <DeadlySinsChart key={String(historyFilter)} rounds={filteredDeadlySinsRounds} filter={historyFilter} />}

                        {!incompleteRound && roundHistory.length > 0 && (
                            <View testID="par-averages-container" style={styles.parAverages.container}>
                                <Text style={styles.parAverages.heading}>Average score by par</Text>
                                <View style={styles.parAverages.row}>
                                    {([3, 4, 5] as const).map(par => {
                                        const val = parAverages[`par${par}` as keyof ParAverages];
                                        return (
                                            <View key={par} style={styles.parAverages.cell}>
                                                <Text style={styles.parAverages.parLabel}>Par {par}</Text>
                                                <Text
                                                    testID={`par-averages-par${par}`}
                                                    style={styles.parAverages.value}
                                                >
                                                    {val !== null ? val.toFixed(2) : '-'}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {!incompleteRound && roundHistory.length > 0 && (
                            <View style={{ padding: 5 }}>
                                <Text style={styles.subHeaderText}>
                                    Round history
                                </Text>
                                <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colours.primary }]}>
                                    <Text testID="round-history-header-date" style={[styles.smallText, localStyles.historyDateColumn]}>Date Course</Text>
                                    <Text testID="round-history-header-strokes" style={[styles.smallText, localStyles.historyTotalColumn, { textAlign: 'left' }]}>Score</Text>
                                    <Text testID="round-history-header-7DS" style={[styles.smallText, localStyles.historyNarrowColumn]}>7DS</Text>
                                </View>
                                <ScrollView testID="round-history-scroll" style={localStyles.roundHistoryScroll} nestedScrollEnabled>
                                    {filteredRoundHistory.map((round) => (
                                        <TouchableOpacity
                                            key={round.Id}
                                            testID={`round-history-row-${round.Id}`}
                                            onPress={() => router.push({ pathname: '/play/scorecard', params: { roundId: String(round.Id) } })}
                                        >
                                            <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colours.primary }]}>
                                                <Text style={[styles.smallTextNoPadding, localStyles.historyDateColumn]}>{round.CourseName ? `${round.Created_At} ${round.CourseName}` : round.Created_At}{round.HolesPlayed < 18 ? ` (${round.HolesPlayed})` : ''}</Text>
                                                <View style={[styles.row, localStyles.historyTotalColumn]}>
                                                    <Text testID={`round-history-strokes-${round.Id}`} style={styles.smallTextNoPadding}>
                                                        {round.StrokeTotal !== null && round.StrokeTotal !== undefined ? String(round.StrokeTotal) : '-'}
                                                    </Text>
                                                    <Text style={[styles.smallTextNoPadding, { textAlign: 'right' }]}>
                                                        &nbsp;({formatScore(round.TotalScore)})
                                                    </Text>
                                                </View>
                                                <Text style={[styles.smallTextNoPadding, localStyles.historyNarrowColumn]}>
                                                    {deadlySinsMap.has(round.Id) ? deadlySinsMap.get(round.Id) : '-'}
                                                </Text>


                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}

                {!isRoundActive && showPlayerSetup && displaySection('play-score') && (
                    <View style={styles.container}>
                        <PlayerSetup onStartRound={handleStartRound} onCancel={() => setShowPlayerSetup(false)} recentCourseNames={recentCourseNames} recentPlayerNames={recentPlayerNames} />
                    </View>
                )}

                {isRoundActive && !scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <View>
                            <HoleScoreInput
                                holeNumber={currentHole}
                                players={players}
                                onScoresChange={handleScoresChange}
                                renderAfterUser={
                                    <DeadlySinsTally
                                        key={`tally-${currentHole}`}
                                        onEndRound={() => { }}
                                        roundControlled={true}
                                        onValuesChange={handledeadlySinsValuesChange}
                                        initialValues={deadlySinsValues}
                                        holePar={currentHoleData?.holePar}
                                        userScore={currentHoleData?.scores.find(s => {
                                            const player = players.find(p => p.Id === s.playerId);
                                            return player && player.IsUser === 1;
                                        })?.score}
                                    />
                                }
                            />

                            {!showEndRoundConfirm && (
                                <View>
                                    <TouchableOpacity
                                        testID="next-hole-button"
                                        onPress={handleNextHole}
                                        style={localStyles.nextHoleButton}
                                    >
                                        <Text style={localStyles.nextHoleButtonText}>Next hole</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        testID="previous-hole-button"
                                        onPress={handlePreviousHole}
                                        style={{ padding: 12, alignItems: 'center', marginTop: 4 }}
                                    >
                                        <Text style={{ color: colours.primary, fontSize: fontSizes.normal }}>Previous hole</Text>
                                    </TouchableOpacity>

                                    <View style={styles.contentSection}>
                                        <Text style={styles.normalText}>
                                            Golf is a game; have fun & be kind to yourself!
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {!showEndRoundConfirm && (
                                <TouchableOpacity
                                    testID="end-round-button"
                                    onPress={handleEndRoundPress}
                                    style={{ padding: 12, alignItems: 'center', marginTop: 20 }}
                                >
                                    <Text style={{ color: colours.red, fontSize: fontSizes.normal }}>End round</Text>
                                </TouchableOpacity>
                            )}

                            {showEndRoundConfirm && (
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                                    <TouchableOpacity
                                        testID="cancel-end-round-button"
                                        onPress={handleCancelEndRound}
                                        style={[styles.mediumButton, { backgroundColor: colours.red }]}
                                    >
                                        <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="confirm-end-round-button"
                                        onPress={handleConfirmEndRound}
                                        style={styles.mediumButton}
                                    >
                                        <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <Text style={localStyles.scorecardHeader}>Scorecard</Text>
                        <Scorecard
                            players={scorecardData.players}
                            holeScores={scorecardData.holeScores}
                        />
                        <TouchableOpacity
                            testID="scorecard-done-button"
                            onPress={handleScorecardDone}
                            style={localStyles.actionButton}
                        >
                            <Text style={localStyles.actionButtonText}>Done</Text>
                        </TouchableOpacity>
                        {analyseRoundEnabled && (
                            <TouchableOpacity
                                testID="scorecard-analyse-button"
                                onPress={() => {
                                    logEvent('analyse_round', { roundId: activeRoundId! });
                                    router.push({ pathname: '/play/round-analysis', params: { roundId: activeRoundId! } });
                                }}
                                style={[localStyles.actionButton, { backgroundColor: colours.tertiary, marginTop: 12 }]}
                            >
                                <Text style={localStyles.actionButtonText}>Analyse your round</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {displaySection('play-distances') && (
                    <View style={styles.container}>
                        <DistancesScreen />
                    </View>
                )}

                {displaySection('play-wedge-chart') && (
                    <View style={styles.container}>
                        <WedgeChartScreen />
                    </View>
                )}
            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Play"
                steps={ONBOARDING_STEPS}
            />
        </GestureHandlerRootView>
    );
}
