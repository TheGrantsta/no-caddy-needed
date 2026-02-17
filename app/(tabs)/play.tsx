import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MultiplayerHoleScoreInput from '../../components/MultiplayerHoleScoreInput';
import Tiger5Tally from '../../components/Tiger5Tally';
import Tiger5Chart from '../../components/Tiger5Chart';
import SubMenu from '../../components/SubMenu';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import WedgeChartScreen from '../play/wedge-chart';
import PlayerSetup from '../../components/PlayerSetup';
import MultiplayerScorecard from '../../components/MultiplayerScorecard';
import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertTiger5RoundService,
    getAllTiger5RoundsService,
    addRoundPlayersService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getSettingsService,
    saveSettingsService,
    Round,
    RoundPlayer,
    Tiger5Round,
    MultiplayerRoundScorecard,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder } from '../../service/NotificationService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import fontSizes from '../../assets/font-sizes';
import { StyleSheet } from 'react-native';
import DistancesScreen from '../play/distances';
import { t } from '../../assets/i18n/i18n';

const ONBOARDING_STEPS = [
    { text: t('play.onboardingStep1') },
    { text: t('play.onboardingStep2') },
    { text: t('play.onboardingStep3') },
];

const formatScore = (score: number): string => {
    if (score === 0) return t('common.evenPar');
    if (score > 0) return `${t('common.overParPrefix')}${score}`;
    return `${score}`;
};

export default function Play() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const [refreshing, setRefreshing] = useState(false);
    const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
    const [currentHole, setCurrentHole] = useState(1);
    const [runningTotal, setRunningTotal] = useState(0);
    const [roundHistory, setRoundHistory] = useState<Round[]>([]);
    const [tiger5Rounds, setTiger5Rounds] = useState<Tiger5Round[]>([]);
    const [section, setSection] = useState('play-score');
    const [tiger5Values, setTiger5Values] = useState({ threePutts: 0, doubleBogeys: 0, bogeysPar5: 0, bogeysInside9Iron: 0, doubleChips: 0 });
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [showPlayerSetup, setShowPlayerSetup] = useState(false);
    const [players, setPlayers] = useState<RoundPlayer[]>([]);
    const [currentHoleData, setCurrentHoleData] = useState<{ holeNumber: number; holePar: number; scores: { playerId: number; playerName: string; score: number }[] } | null>(null);
    const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false);
    const [scorecardData, setScorecardData] = useState<MultiplayerRoundScorecard | null>(null);
    const [recentCourseNames, setRecentCourseNames] = useState<string[]>([]);
    const { showError, showResult } = useAppToast();
    const router = useRouter();
    const [settings, setSettings] = useState(getSettingsService());
    const [showOnboarding, setShowOnboarding] = useState(false);

    const localStyles = useMemo(() => StyleSheet.create({
        startRoundContainer: {
            padding: 15,
            alignItems: 'center',
        },
        actionButton: {
            backgroundColor: colours.yellow,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            width: '100%',
            marginTop: 5,
        },
        actionButtonText: {
            color: colours.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        nextHoleButton: {
            backgroundColor: colours.yellow,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center' as const,
            marginTop: 10,
            marginHorizontal: 15,
        },
        nextHoleButtonText: {
            color: colours.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold' as const,
        },
        confirmContainer: {
            marginTop: 20,
            marginHorizontal: 15,
        },
        endRoundButton: {
            backgroundColor: colours.errorText,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center' as const,
            marginTop: 20,
            marginHorizontal: 15,
        },
        endRoundButtonText: {
            color: colours.white,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold' as const,
        },
        roundHistoryScroll: {
            maxHeight: 300,
        },
        historyDateColumn: {
            width: '70%' as const,
        },
        historyNarrowColumn: {
            width: '15%' as const,
            textAlign: 'center' as const,
        },
        scorecardHeader: {
            color: colours.text,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            textAlign: 'center' as const,
            marginTop: 10,
            marginBottom: 5,
        },
    }), [colours]);

    useEffect(() => {
        const activeRound = getActiveRoundService();
        if (activeRound) {
            setActiveRoundId(activeRound.Id);
            const roundPlayers = getRoundPlayersService(activeRound.Id);
            if (roundPlayers.length > 0) {
                setPlayers(roundPlayers);
            }
        }
        const history = getAllRoundHistoryService();
        setRoundHistory(history);
        setTiger5Rounds(getAllTiger5RoundsService());
        setRecentCourseNames(getRecentCourseNamesService());

        const currentSettings = getSettingsService();
        setSettings(currentSettings);
        if (!currentSettings.playOnboardingSeen && history.length === 0 && !activeRound) {
            setShowOnboarding(true);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRoundHistory(getAllRoundHistoryService());
            setTiger5Rounds(getAllTiger5RoundsService());
            setRefreshing(false);
        }, 750);
    };

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

    const handleStartRound = async (playerNames: string[], courseName: string) => {
        const roundId = await startRoundService(courseName);

        if (roundId) {
            const playerIds = await addRoundPlayersService(roundId, playerNames);
            const roundPlayers = playerIds.map((id, index) => ({
                Id: id,
                RoundId: roundId,
                PlayerName: index === 0 ? t('common.you') : playerNames[index - 1],
                IsUser: index === 0 ? 1 : 0,
                SortOrder: index,
            }));

            setActiveRoundId(roundId);
            setPlayers(roundPlayers);
            setCurrentHole(1);
            setRunningTotal(0);
            setShowPlayerSetup(false);
            const nId = await scheduleRoundReminder();
            setNotificationId(nId);
        } else {
            showError(t('play.failedToStart'));
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

    const handleNextHole = async () => {
        if (!activeRoundId) return;

        const { holeNumber, holePar, scores } = currentHoleData || buildDefaultHoleData();
        const success = await addMultiplayerHoleScoresService(activeRoundId, holeNumber, holePar, scores);
        if (success) {
            const userScore = scores.find(s => {
                const player = players.find(p => p.Id === s.playerId);
                return player && player.IsUser === 1;
            });
            if (userScore) {
                setRunningTotal(prev => prev + (userScore.score - holePar));
            }
            setCurrentHoleData(null);
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

    const handleTiger5ValuesChange = (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number) => {
        setTiger5Values({ threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips });
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
        setRunningTotal(0);
        setSection('play-score');
        setTiger5Values({ threePutts: 0, doubleBogeys: 0, bogeysPar5: 0, bogeysInside9Iron: 0, doubleChips: 0 });
        setPlayers([]);
        setShowPlayerSetup(false);
        setCurrentHoleData(null);
        setShowEndRoundConfirm(false);
        setScorecardData(null);
        setRoundHistory(getAllRoundHistoryService());
        setTiger5Rounds(getAllTiger5RoundsService());
        setRecentCourseNames(getRecentCourseNamesService());
    };

    const handleConfirmEndRound = async () => {
        if (!activeRoundId) return;

        await cancelRoundReminder(notificationId);
        setNotificationId(null);

        const success = await endRoundService(activeRoundId);

        if (runningTotal > 0) {
            await insertTiger5RoundService(
                tiger5Values.threePutts,
                tiger5Values.doubleBogeys,
                tiger5Values.bogeysPar5,
                tiger5Values.bogeysInside9Iron,
                tiger5Values.doubleChips,
            );
        }

        showResult(success, t('play.roundSaved'), t('play.roundNotSaved'));

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

    const isRoundActive = activeRoundId !== null;

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>{t('common.releaseToUpdate')}</Text>
                </View>
            )}

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colours.yellow}
                    />
                }
            >

                <SubMenu showSubMenu="play" selectedItem={section} handleSubMenu={handleSubMenu} />

                {!isRoundActive && !showPlayerSetup && !scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity
                                    testID="play-onboarding-info-button"
                                    onPress={handleShowOnboarding}
                                    style={{ padding: 4 }}
                                >
                                    <MaterialIcons name="info-outline" size={24} color={colours.yellow} />
                                </TouchableOpacity>
                                <Text style={[styles.headerText, styles.marginTop]}>{t('play.title')}</Text>
                            </View>
                            <TouchableOpacity
                                testID="start-round-button"
                                onPress={handleShowPlayerSetup}
                                style={localStyles.actionButton}
                            >
                                <Text style={localStyles.actionButtonText}>{t('play.startRound')}</Text>
                            </TouchableOpacity>
                        </View>

                        <Tiger5Chart rounds={tiger5Rounds} />

                        {roundHistory.length === 0 && (
                            <View style={styles.headerContainer}>
                                <Text style={[styles.normalText, styles.marginTop]}>
                                    {t('play.noRoundHistory')}
                                </Text>
                            </View>
                        )}

                        {roundHistory.length > 0 && (() => {
                            const tiger5Map = new Map(tiger5Rounds.map(r => [r.Created_At, r.Total]));
                            return (
                                <View style={{ padding: 15 }}>
                                    <Text style={[styles.subHeaderText, { textAlign: 'center' }]}>
                                        {t('play.roundHistory')}
                                    </Text>
                                    <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colours.yellow }]}>
                                        <Text testID="round-history-header-date" style={[styles.normalText, localStyles.historyDateColumn]}>{t('play.dateHeader')}</Text>
                                        <Text testID="round-history-header-score" style={[styles.normalText, localStyles.historyNarrowColumn]}>{t('play.scoreHeader')}</Text>
                                        <Text testID="round-history-header-t5" style={[styles.normalText, localStyles.historyNarrowColumn]}>{t('play.t5Header')}</Text>
                                    </View>
                                    <ScrollView testID="round-history-scroll" style={localStyles.roundHistoryScroll} nestedScrollEnabled>
                                        {roundHistory.slice(0, 30).map((round) => (
                                            <TouchableOpacity
                                                key={round.Id}
                                                testID={`round-history-row-${round.Id}`}
                                                onPress={() => router.push({ pathname: '/play/scorecard', params: { roundId: String(round.Id) } })}
                                            >
                                                <View style={[styles.row, { paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colours.yellow }]}>
                                                    <Text style={[styles.normalText, localStyles.historyDateColumn]}>{round.CourseName ? `${round.Created_At} - ${round.CourseName}` : round.Created_At}</Text>
                                                    <Text style={[styles.normalText, localStyles.historyNarrowColumn]}>{formatScore(round.TotalScore)}</Text>
                                                    <Text style={[styles.normalText, localStyles.historyNarrowColumn]}>{tiger5Map.has(round.Created_At) ? tiger5Map.get(round.Created_At) : '-'}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            );
                        })()}
                    </View>
                )}

                {!isRoundActive && showPlayerSetup && displaySection('play-score') && (
                    <View style={styles.container}>
                        <PlayerSetup onStartRound={handleStartRound} onCancel={() => setShowPlayerSetup(false)} recentCourseNames={recentCourseNames} />
                    </View>
                )}

                {isRoundActive && !scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <View>
                            <MultiplayerHoleScoreInput
                                holeNumber={currentHole}
                                players={players}
                                onScoresChange={handleScoresChange}
                                renderAfterUser={
                                    <Tiger5Tally
                                        onEndRound={() => { }}
                                        roundControlled={true}
                                        onValuesChange={handleTiger5ValuesChange}
                                        holePar={currentHoleData?.holePar}
                                        userScore={currentHoleData?.scores.find(s => {
                                            const player = players.find(p => p.Id === s.playerId);
                                            return player && player.IsUser === 1;
                                        })?.score}
                                    />
                                }
                            />

                            <TouchableOpacity
                                testID="next-hole-button"
                                onPress={handleNextHole}
                                style={localStyles.nextHoleButton}
                            >
                                <Text style={localStyles.nextHoleButtonText}>{t('play.nextHole')}</Text>
                            </TouchableOpacity>

                            {!showEndRoundConfirm && (
                                <TouchableOpacity
                                    testID="end-round-button"
                                    onPress={handleEndRoundPress}
                                    style={{ padding: 12, alignItems: 'center', marginTop: 20 }}
                                >
                                    <Text style={{ color: colours.errorText, fontSize: fontSizes.normal }}>{t('play.endRound')}</Text>
                                </TouchableOpacity>
                            )}

                            {showEndRoundConfirm && (
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                                    <TouchableOpacity
                                        testID="cancel-end-round-button"
                                        onPress={handleCancelEndRound}
                                        style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: colours.backgroundAlternate }}
                                    >
                                        <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>{t('common.cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="confirm-end-round-button"
                                        onPress={handleConfirmEndRound}
                                        style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: colours.errorText }}
                                    >
                                        <Text style={{ color: colours.text, fontSize: fontSizes.normal }}>{t('play.confirmEndRound')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {scorecardData && displaySection('play-score') && (
                    <View style={styles.container}>
                        <Text style={localStyles.scorecardHeader}>{t('play.scorecard')}</Text>
                        <MultiplayerScorecard
                            round={scorecardData.round}
                            players={scorecardData.players}
                            holeScores={scorecardData.holeScores}
                        />
                        <TouchableOpacity
                            testID="scorecard-done-button"
                            onPress={handleScorecardDone}
                            style={localStyles.actionButton}
                        >
                            <Text style={localStyles.actionButtonText}>{t('common.done')}</Text>
                        </TouchableOpacity>
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
                title={t('play.onboardingTitle')}
                steps={ONBOARDING_STEPS}
            />
        </GestureHandlerRootView>
    );
}
