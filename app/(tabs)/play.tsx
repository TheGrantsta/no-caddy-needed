import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useToast } from 'react-native-toast-notifications';
import { useRouter } from 'expo-router';
import MultiplayerHoleScoreInput from '../../components/MultiplayerHoleScoreInput';
import Tiger5Tally from '../../components/Tiger5Tally';
import SubMenu from '../../components/SubMenu';
import ClubDistanceList from '../../components/ClubDistanceList';
import WedgeChart from '../../components/WedgeChart';
import PlayerSetup from '../../components/PlayerSetup';
import {
    startRoundService,
    endRoundService,
    addMultiplayerHoleScoresService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertTiger5RoundService,
    getClubDistancesService,
    addRoundPlayersService,
    getRoundPlayersService,
    Round,
    RoundPlayer,
} from '../../service/DbService';
import { scheduleRoundReminder, cancelRoundReminder } from '../../service/NotificationService';
import styles from '../../assets/stlyes';
import colours from '../../assets/colours';
import fontSizes from '../../assets/font-sizes';
import { StyleSheet } from 'react-native';

const formatScore = (score: number): string => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return `${score}`;
};

export default function Play() {
    const [refreshing, setRefreshing] = useState(false);
    const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
    const [currentHole, setCurrentHole] = useState(1);
    const [runningTotal, setRunningTotal] = useState(0);
    const [roundHistory, setRoundHistory] = useState<Round[]>([]);
    const [section, setSection] = useState('play-score');
    const [tiger5Values, setTiger5Values] = useState({ threePutts: 0, doubleBogeys: 0, bogeysPar5: 0, bogeysInside9Iron: 0, doubleChips: 0 });
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [showPlayerSetup, setShowPlayerSetup] = useState(false);
    const [players, setPlayers] = useState<RoundPlayer[]>([]);
    const [currentHoleData, setCurrentHoleData] = useState<{ holeNumber: number; holePar: number; scores: { playerId: number; playerName: string; score: number }[] } | null>(null);
    const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        const activeRound = getActiveRoundService();
        if (activeRound) {
            setActiveRoundId(activeRound.Id);
            const roundPlayers = getRoundPlayersService(activeRound.Id);
            if (roundPlayers.length > 0) {
                setPlayers(roundPlayers);
            }
        }
        setRoundHistory(getAllRoundHistoryService());
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRoundHistory(getAllRoundHistoryService());
            setRefreshing(false);
        }, 750);
    };

    const handleShowPlayerSetup = () => {
        setShowPlayerSetup(true);
    };

    const handleStartRound = async (playerNames: string[]) => {
        const roundId = await startRoundService(72);

        if (roundId) {
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
            setRunningTotal(0);
            setShowPlayerSetup(false);
            const nId = await scheduleRoundReminder();
            setNotificationId(nId);
        } else {
            toast.show('Failed to start round', {
                type: 'danger',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.errorText, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
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
            setCurrentHole(prev => prev + 1);
        }
    };

    const isUserOverParOnCurrentHole = (): boolean => {
        if (!currentHoleData) return false;
        const userPlayer = players.find(p => p.IsUser === 1);
        if (!userPlayer) return false;
        const userScore = currentHoleData.scores.find(s => s.playerId === userPlayer.Id);
        if (!userScore) return false;
        return userScore.score > currentHoleData.holePar;
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

    const handleConfirmEndRound = async () => {
        if (!activeRoundId) return;

        await cancelRoundReminder(notificationId);
        setNotificationId(null);

        const success = await endRoundService(activeRoundId);

        // Save Tiger 5 only if above par
        if (runningTotal > 0) {
            await insertTiger5RoundService(
                tiger5Values.threePutts,
                tiger5Values.doubleBogeys,
                tiger5Values.bogeysPar5,
                tiger5Values.bogeysInside9Iron,
                tiger5Values.doubleChips,
            );
        }

        toast.show(success ? 'Round saved' : 'Round not saved', {
            type: success ? 'success' : 'danger',
            textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
            style: {
                borderLeftColor: success ? colours.green : colours.errorText,
                borderLeftWidth: 10,
                backgroundColor: colours.yellow,
            },
        });

        setActiveRoundId(null);
        setCurrentHole(1);
        setRunningTotal(0);
        setSection('play-score');
        setTiger5Values({ threePutts: 0, doubleBogeys: 0, bogeysPar5: 0, bogeysInside9Iron: 0, doubleChips: 0 });
        setPlayers([]);
        setShowPlayerSetup(false);
        setCurrentHoleData(null);
        setShowEndRoundConfirm(false);
        setRoundHistory(getAllRoundHistoryService());
    };

    const isRoundActive = activeRoundId !== null;

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>Release to update</Text>
                </View>
            )}

            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colours.yellow}
                    />
                }
            >

                <SubMenu showSubMenu="play" selectedItem={section} handleSubMenu={handleSubMenu} />

                {!isRoundActive && !showPlayerSetup && (
                    <View style={styles.container}>
                        <View style={localStyles.startRoundContainer}>
                            <TouchableOpacity
                                testID="start-round-button"
                                onPress={handleShowPlayerSetup}
                                style={localStyles.actionButton}
                            >
                                <Text style={localStyles.actionButtonText}>Start round</Text>
                            </TouchableOpacity>
                        </View>

                        {roundHistory.length === 0 && (
                            <View style={styles.headerContainer}>
                                <Text style={[styles.normalText, styles.marginTop]}>
                                    No round history yet
                                </Text>
                            </View>
                        )}

                        {roundHistory.length > 0 && (
                            <View style={{ padding: 15 }}>
                                <Text style={[styles.subHeaderText, { textAlign: 'center' }]}>
                                    Round history
                                </Text>
                                <View style={[styles.row, { justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colours.yellow }]}>
                                    <Text style={styles.header}>Date</Text>
                                    <Text style={styles.header}>Score</Text>
                                </View>
                                {roundHistory.map((round) => (
                                    <View key={round.Id} style={[styles.row, { justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colours.yellow }]}>
                                        <Text style={styles.normalText}>{round.Created_At}</Text>
                                        <Text style={styles.normalText}>{formatScore(round.TotalScore)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {!isRoundActive && showPlayerSetup && (
                    <View style={styles.container}>
                        <PlayerSetup onStartRound={handleStartRound} />
                    </View>
                )}

                {isRoundActive && (
                    <View style={styles.container}>
                        {displaySection('play-score') && (
                            <View>
                                <MultiplayerHoleScoreInput
                                    holeNumber={currentHole}
                                    players={players}
                                    onScoresChange={handleScoresChange}
                                />

                                {isUserOverParOnCurrentHole() && (
                                    <Tiger5Tally
                                        onEndRound={() => { }}
                                        roundControlled={true}
                                        onValuesChange={handleTiger5ValuesChange}
                                    />
                                )}

                                <TouchableOpacity
                                    testID="next-hole-button"
                                    onPress={handleNextHole}
                                    style={localStyles.nextHoleButton}
                                >
                                    <Text style={localStyles.nextHoleButtonText}>Next hole</Text>
                                </TouchableOpacity>

                                {!showEndRoundConfirm && (
                                    <TouchableOpacity
                                        testID="end-round-button"
                                        onPress={handleEndRoundPress}
                                        style={localStyles.endRoundButton}
                                    >
                                        <Text style={localStyles.endRoundButtonText}>End round</Text>
                                    </TouchableOpacity>
                                )}

                                {showEndRoundConfirm && (
                                    <View style={localStyles.confirmContainer}>
                                        <TouchableOpacity
                                            testID="confirm-end-round-button"
                                            onPress={handleConfirmEndRound}
                                            style={localStyles.endRoundButton}
                                        >
                                            <Text style={localStyles.endRoundButtonText}>Confirm end round</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            testID="cancel-end-round-button"
                                            onPress={handleCancelEndRound}
                                            style={localStyles.nextHoleButton}
                                        >
                                            <Text style={localStyles.nextHoleButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        {displaySection('play-distances') && (
                            <ClubDistanceList distances={getClubDistancesService()} editable={false} />
                        )}

                        {displaySection('play-wedge-chart') && (
                            <View>
                                <Text style={[styles.normalText, { textAlign: 'center', marginTop: 10 }]}>
                                    Your wedge distances
                                </Text>
                                <WedgeChart isShowButtons={false} />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}

const localStyles = StyleSheet.create({
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
});
