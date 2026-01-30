import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useToast } from 'react-native-toast-notifications';
import { useRouter } from 'expo-router';
import HoleScoreInput from '../../components/HoleScoreInput';
import Tiger5Tally from '../../components/Tiger5Tally';
import SubMenu from '../../components/SubMenu';
import ClubDistanceList from '../../components/ClubDistanceList';
import WedgeChart from '../../components/WedgeChart';
import {
    startRoundService,
    endRoundService,
    addHoleScoreService,
    getActiveRoundService,
    getAllRoundHistoryService,
    insertTiger5RoundService,
    getClubDistancesService,
    Round,
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
    const [showTiger5, setShowTiger5] = useState(false);
    const [tiger5Values, setTiger5Values] = useState({ threePutts: 0, doubleBogeys: 0, bogeysPar5: 0, bogeysInside9Iron: 0, doubleChips: 0 });
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        const activeRound = getActiveRoundService();
        if (activeRound) {
            setActiveRoundId(activeRound.Id);
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

    const handleStartRound = async () => {
        const roundId = await startRoundService(72);

        if (roundId) {
            setActiveRoundId(roundId);
            setCurrentHole(1);
            setRunningTotal(0);
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

    const handleScore = async (holeNumber: number, score: number) => {
        if (!activeRoundId) return;

        const success = await addHoleScoreService(activeRoundId, holeNumber, score);
        if (success) {
            setRunningTotal(prev => prev + score);
            setCurrentHole(prev => prev + 1);
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

    const handleEndRound = async () => {
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
        setShowTiger5(false);
        setTiger5Values({ threePutts: 0, doubleBogeys: 0, bogeysPar5: 0, bogeysInside9Iron: 0, doubleChips: 0 });
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

                {!isRoundActive && (
                    <View style={styles.container}>
                        <View style={localStyles.startRoundContainer}>
                            <TouchableOpacity
                                testID="start-round-button"
                                onPress={handleStartRound}
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

                {isRoundActive && (
                    <View style={styles.container}>
                        {/* <Text testID="running-total" style={localStyles.runningTotal}>
                            {formatScore(runningTotal)}
                        </Text> */}

                        {displaySection('play-score') && (
                            <View>
                                <View style={styles.headerContainer}>
                                    <Text style={[styles.normalText, styles.marginTop, styles.marginBottom]}>
                                        Round in progress
                                    </Text>
                                </View>

                                <View style={localStyles.toggleRow}>
                                    <TouchableOpacity
                                        testID="toggle-score"
                                        onPress={() => setShowTiger5(false)}
                                        style={[localStyles.toggleButton, !showTiger5 && localStyles.toggleActive]}
                                    >
                                        <Text style={[localStyles.toggleText, !showTiger5 && localStyles.toggleTextActive]}>Score</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="toggle-tiger5"
                                        onPress={() => setShowTiger5(true)}
                                        style={[localStyles.toggleButton, showTiger5 && localStyles.toggleActive]}
                                    >
                                        <Text style={[localStyles.toggleText, showTiger5 && localStyles.toggleTextActive]}>Tiger 5</Text>
                                    </TouchableOpacity>
                                </View>

                                {!showTiger5 && (
                                    <HoleScoreInput
                                        holeNumber={currentHole}
                                        onScore={handleScore}
                                    />
                                )}

                                {showTiger5 && (
                                    <Tiger5Tally
                                        onEndRound={() => { }}
                                        roundControlled={true}
                                        onValuesChange={handleTiger5ValuesChange}
                                    />
                                )}

                                <TouchableOpacity
                                    testID="end-round-button"
                                    onPress={handleEndRound}
                                    style={[localStyles.actionButton, localStyles.endRoundButton]}
                                >
                                    <Text style={localStyles.actionButtonText}>End round</Text>
                                </TouchableOpacity>
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
    endRoundButton: {
        backgroundColor: colours.errorText,
        marginTop: 20,
        marginHorizontal: 15,
    },
    runningTotal: {
        color: colours.yellow,
        fontSize: fontSizes.massive,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colours.yellow,
    },
    toggleActive: {
        backgroundColor: colours.yellow,
    },
    toggleText: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
    },
    toggleTextActive: {
        color: colours.background,
    },
});
