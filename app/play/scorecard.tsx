import { useState, useEffect, useCallback } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RoundScorecard from '../../components/RoundScorecard';
import Scorecard from '../../components/Scorecard';
import ScorecardActionButtons from '../../components/ScorecardActionButtons';
import DeleteRoundSheet from '../../components/DeleteRoundSheet';
import EditRoundSheet from '../../components/EditRoundSheet';
import EditHoleSheet from '../../components/EditHoleSheet';
import SinDetailsInput from '../../components/SinDetailsInput';
import RoundSummaryCard from '../../components/RoundSummaryCard';
import RoundScoreTable from '../../components/RoundScoreTable';
import { useAppToast } from '../../hooks/useAppToast';
import { saveScorecardEditsService } from '../../service/ScorecardEditService';
import { useScorecardEdit } from '../../hooks/useScorecardEdit';
import {
    getRoundScorecardService,
    getMultiplayerScorecardService,
    deleteRoundService,
    getHoleDeadlySinsService,
    getHolesWithSinsForRoundService,
    getAllRoundHistoryService,
    getRoundScoreBreakdownService,
    getClubDistancesService,
    getHoleSinDetailsService,
    getPuttingStatsService,
    MultiplayerRoundScorecard,
    RoundScorecard as RoundScorecardType,
    DeadlySinsValues,
    Round,
    RoundScoreBreakdown,
    ClubDistance,
} from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { formatLongDate } from '../../utils/drillHistory';
import fontSizes from '../../assets/font-sizes';
import { useOrientation } from '../../hooks/useOrientation';

const INITIAL_SINS: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

// The swipe pager covers the most recent rounds only (keeps the dot row readable).
const MAX_PAGER_ROUNDS = 10;

const SIN_LABELS: { key: keyof DeadlySinsValues; label: string }[] = [
    { key: 'troubleOffTee', label: 'Trouble off tee' },
    { key: 'penalties', label: 'Penalty' },
    { key: 'threePutts', label: '3-putt' },
    { key: 'bogeysInside9Iron', label: 'Bogey inside 9-iron' },
    { key: 'doubleChips', label: 'Double chip' },
    { key: 'doubleBogeys', label: 'Double bogey' },
    { key: 'bogeysPar5', label: 'Bogey on a par 5' },
];

type ScorecardPageProps = {
    roundId: string;
    width: number;
    onEditingChange: (roundId: string, isEditing: boolean) => void;
};

// One full-width page: a single round's scorecard, with its own edit/delete state.
function ScorecardPage({ roundId, width, onEditingChange }: ScorecardPageProps) {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const { showError, showResult, showInfo } = useAppToast();
    const router = useRouter();

    const [multiplayerScorecard, setMultiplayerScorecard] = useState<MultiplayerRoundScorecard | null>(null);
    const [scorecard, setScorecard] = useState<RoundScorecardType | null>(null);
    const [sinHoles, setSinHoles] = useState<Set<number>>(new Set());
    const [scoreBreakdown, setScoreBreakdown] = useState<RoundScoreBreakdown | null>(null);
    const [clubDistances, setClubDistances] = useState<ClubDistance[]>([]);
    // The date picked in the edit round sheet; null until the user picks one, so an untouched date is never saved
    const [editedDate, setEditedDate] = useState<Date | null>(null);

    const edit = useScorecardEdit();

    const loadData = useCallback(() => {
        const mp = getMultiplayerScorecardService(Number(roundId));
        setMultiplayerScorecard(mp);
        const sc = mp ? null : getRoundScorecardService(Number(roundId));
        setScorecard(sc);
        setSinHoles(getHolesWithSinsForRoundService(Number(roundId)));
        setScoreBreakdown(getRoundScoreBreakdownService(Number(roundId)));
        setClubDistances(getClubDistancesService());
    }, [roundId]);

    // Loads the round from SQLite; runs on mount and whenever the round changes.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    // Report edit state up so the pager can lock horizontal swiping. Called from the
    // edit/cancel/save handlers (user actions) rather than an effect, so it never fires
    // on mount (which would schedule a pager state update outside test act() blocks).
    const setEditing = (editing: boolean) => {
        edit.setIsEditing(editing);
        onEditingChange(roundId, editing);
    };

    const handleEdit = () => {
        if (multiplayerScorecard) {
            edit.setEditedScores([...multiplayerScorecard.holeScores.map(s => ({ ...s }))]);
            setEditing(true);
            edit.setSelectedScore(null);
        }
    };

    const handleCancelEdit = () => {
        edit.resetEditState();
        setEditedDate(null);
        setEditing(false);
    };

    const handleScoreSelect = (holeNumber: number, playerId: number) => {
        edit.setSelectedScore({ holeNumber, playerId });
        const isUserPlayer = multiplayerScorecard?.players.find(p => p.Id === playerId)?.IsUser === 1;
        const isScoreOnlyRound = multiplayerScorecard?.round.IsScoreOnly === 1;
        if (isUserPlayer && !isScoreOnlyRound) {
            const existing = getHoleDeadlySinsService(Number(roundId), holeNumber);
            edit.setEditedSins(existing ?? INITIAL_SINS);
            edit.setSinsHoleNumber(holeNumber);
            const existingDetails = getHoleSinDetailsService(Number(roundId), holeNumber);
            edit.setSelectedOffTeeClub(existingDetails?.TroubleOffTeeClub);
            edit.setSelectedPenaltyType(existingDetails?.PenaltyType);
            edit.setSelectedBogeysClub(existingDetails?.BogeysInside9IronClub);
            edit.setSelectedDoubleChipReason(existingDetails?.DoubleChipsReason);
            edit.setHadPriorSinDetails(!!existingDetails);
            edit.setSinDetailsClubError(false);
            edit.setSinDetailsPenaltyError(false);
            edit.setSinDetailsBogeysClubError(false);
            edit.setSinDetailsDoubleChipReasonError(false);
            const existingPuttingStats = getPuttingStatsService(Number(roundId), holeNumber);
            edit.setPuttingStats(existingPuttingStats ? {
                firstPutt: existingPuttingStats.FirstPuttDistance,
                secondPutt: existingPuttingStats.SecondPuttDistance || undefined,
                secondIsLong: !!existingPuttingStats.SecondPuttIsLong,
                greenInRegulation: !!existingPuttingStats.GreenInRegulation,
            } : null);
            edit.setHadPriorPuttingStats(!!existingPuttingStats);
        } else {
            edit.clearHoleEdits();
        }
    };


    // Reveal which deadly sin(s) were logged on a hole when its dot is tapped.
    const handleSinPress = (holeNumber: number) => {
        const sins = getHoleDeadlySinsService(Number(roundId), holeNumber);
        const names = sins ? SIN_LABELS.filter(({ key }) => sins[key]).map(({ label }) => label) : [];
        showInfo(names.length > 0
            ? `Hole ${holeNumber}: ${names.join(', ')}`
            : `Hole ${holeNumber}: deadly sin logged`);
    };

    const handleParChange = (holePar: number) => {
        const selected = edit.selectedScore;
        if (!selected) return;
        edit.setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === selected.holeNumber ? { ...s, HolePar: holePar } : s
            )
        );
    };

    const handleIncrement = () => {
        const selected = edit.selectedScore;
        if (!selected) return;
        edit.setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === selected.holeNumber && s.RoundPlayerId === selected.playerId
                    ? { ...s, Score: s.Score + 1 }
                    : s
            )
        );
    };

    const handleDecrement = () => {
        const selected = edit.selectedScore;
        if (!selected) return;
        edit.setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === selected.holeNumber && s.RoundPlayerId === selected.playerId
                    ? { ...s, Score: Math.max(1, s.Score - 1) }
                    : s
            )
        );
    };

    const handleSave = async () => {
        if (edit.sinsHoleNumber !== null && edit.editedSins !== null) {
            const needsClub = edit.editedSins.troubleOffTee && clubDistances.length > 0;
            const needsPenalty = edit.editedSins.penalties;
            const needsBogeysClub = edit.editedSins.bogeysInside9Iron && clubDistances.length > 0;
            const needsDoubleChipReason = edit.editedSins.doubleChips;

            const isValid = edit.validateSinDetails(clubDistances, needsClub, needsPenalty, needsBogeysClub, needsDoubleChipReason);
            if (!isValid) return;
        }

        if (!multiplayerScorecard) return;

        const result = await saveScorecardEditsService({
            roundId: Number(roundId),
            original: multiplayerScorecard.holeScores,
            edited: edit.editedScores,
            hole: {
                holeNumber: edit.sinsHoleNumber,
                sins: edit.editedSins,
                sinDetails: {
                    troubleOffTeeClub: edit.selectedOffTeeClub,
                    penaltyType: edit.selectedPenaltyType,
                    bogeysInside9IronClub: edit.selectedBogeysClub,
                    doubleChipsReason: edit.selectedDoubleChipReason,
                },
                hadPriorSinDetails: edit.hadPriorSinDetails,
                puttingStats: edit.puttingStats,
            },
            newStartTime: editedDate,
        });

        if (result === 'missing-first-putt') {
            showError('Enter the first putt distance');
            return;
        }
        if (result === 'failed') {
            showResult(false, 'Scorecard updated', 'Failed to update scorecard');
            return;
        }

        showResult(true, 'Scorecard updated', 'Failed to update scorecard');
        setEditedDate(null);
        loadData();
        edit.resetEditState();
        setEditing(false);
    };

    const handleDelete = () => {
        edit.setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        const success = await deleteRoundService(Number(roundId));
        showResult(success, 'Round deleted', 'Failed to delete round');
        if (success) {
            router.back();
        } else {
            edit.setShowDeleteConfirm(false);
        }
    };

    const handleCancelDelete = () => {
        edit.setShowDeleteConfirm(false);
    };

    const round = multiplayerScorecard?.round || scorecard?.round;
    const courseName = round?.CourseName;
    const roundDate = round ? formatLongDate(round.StartTime || round.Created_At) : null;
    // The picker starts on the round's own date; once the user picks one, that date is what the row shows
    const roundStartDate = round?.StartTime ? new Date(round.StartTime) : new Date();
    const shownRoundDate = editedDate ?? roundStartDate;
    const editRoundDateLabel = editedDate ? (formatLongDate(editedDate.toISOString()) ?? '') : (roundDate ?? '');
    // Rounds cannot be dated after today, so the picker stops at the end of today
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (!multiplayerScorecard && !scorecard) {
        return (
            <View testID={`scorecard-page-${roundId}`} style={{ width }}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Round not found</Text>
                </View>
            </View>
        );
    }

    const displayScores = edit.isEditing ? edit.editedScores : multiplayerScorecard?.holeScores || [];

    const userPlayerId = multiplayerScorecard?.players.find(p => p.IsUser === 1)?.Id;

    // Two-step editing: the round sheet lists the user's holes; a hole opens its own sheet
    const editUserHoles = edit.editedScores
        .filter(h => h.RoundPlayerId === userPlayerId)
        .sort((a, b) => a.HoleNumber - b.HoleNumber);
    const showStats = !round?.IsScoreOnly;
    const editRoundHoles = editUserHoles.map(h => {
        if (!showStats) return { holeNumber: h.HoleNumber, par: h.HolePar, score: h.Score, putts: 0, sins: 0 };
        const sinsForHole = getHoleDeadlySinsService(Number(roundId), h.HoleNumber);
        const puttingForHole = getPuttingStatsService(Number(roundId), h.HoleNumber);
        const sinCount = sinsForHole ? SIN_LABELS.filter(({ key }) => sinsForHole[key]).length : 0;
        const puttCount = puttingForHole ? (puttingForHole.SecondPuttDistance != null ? 2 : 1) + (sinsForHole?.threePutts ? 1 : 0) : 0;
        return { holeNumber: h.HoleNumber, par: h.HolePar, score: h.Score, putts: puttCount, sins: sinCount };
    });
    const editRoundTotal = editUserHoles.reduce((sum, h) => sum + h.Score, 0);
    const selectedEditHole = edit.selectedScore ? editUserHoles.find(h => h.HoleNumber === edit.selectedScore?.holeNumber) : undefined;

    const handleSelectEditHole = (holeNumber: number) => {
        if (userPlayerId !== undefined) handleScoreSelect(holeNumber, userPlayerId);
    };

    const handleStrokesStep = (delta: number) => {
        if (delta > 0) handleIncrement(); else handleDecrement();
    };

    const handlePuttText = (field: 'firstPutt' | 'secondPutt', text: string) => {
        const value = text === '' ? undefined : Number(text);
        edit.setPuttingStats(prev => ({
            firstPutt: prev?.firstPutt,
            secondPutt: prev?.secondPutt,
            secondIsLong: prev?.secondIsLong ?? false,
            greenInRegulation: prev?.greenInRegulation ?? false,
            [field]: value,
        }));
    };

    const handleGreenInRegulationEdit = (value: boolean) => {
        edit.setPuttingStats(prev => ({
            firstPutt: prev?.firstPutt,
            secondPutt: prev?.secondPutt,
            secondIsLong: prev?.secondIsLong ?? false,
            greenInRegulation: value,
        }));
    };

    const handleSinToggle = (key: keyof DeadlySinsValues, value: boolean) => {
        edit.setEditedSins({ ...(edit.editedSins ?? INITIAL_SINS), [key]: value });
    };

    // The signed-in player's holes, for the summary card and score table
    const userHoles = (multiplayerScorecard?.holeScores ?? [])
        .filter(h => h.RoundPlayerId === userPlayerId)
        .sort((a, b) => a.HoleNumber - b.HoleNumber)
        .map(h => ({ holeNumber: h.HoleNumber, par: h.HolePar, score: h.Score }));
    const showSummary = !edit.isEditing && userHoles.length > 0;
    const summaryStats = scoreBreakdown ?? { putts: 0, threePutts: 0, penalties: 0 };

    return (
        <View testID={`scorecard-page-${roundId}`} style={{ width }}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding, { flexGrow: 1, paddingBottom: 24 }]}>
                {!edit.isEditing && (
                    <View testID="scorecard-title-row" style={[styles.headerContainer, { flexDirection: 'row', alignItems: 'center', columnGap: 12 }]}>
                        <TouchableOpacity
                            testID="scorecard-back-button"
                            accessibilityRole="button"
                            accessibilityLabel="Back"
                            onPress={() => router.back()}
                            style={styles.pageHeader.circleButton}
                        >
                            <MaterialIcons name="chevron-left" size={28} color={colours.black} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            {courseName ? (
                                <Text testID="scorecard-course-name" style={[styles.subHeaderText, { padding: 0, textAlign: 'center' }]}>
                                    {courseName}
                                </Text>
                            ) : null}
                            {roundDate ? (
                                <Text testID="scorecard-date" style={[styles.smallText, { textAlign: 'center' }]}>{roundDate}</Text>
                            ) : null}
                        </View>
                        {multiplayerScorecard && !edit.isEditing && !edit.showDeleteConfirm ? (
                            <TouchableOpacity
                                testID="edit-scorecard-button"
                                accessibilityRole="button"
                                onPress={handleEdit}
                                style={{ height: 44, borderRadius: 22, backgroundColor: colours.backgroundLight, justifyContent: 'center', paddingHorizontal: 18 }}
                            >
                                <Text style={{ color: colours.primary, fontSize: fontSizes.normal, fontWeight: '600' }}>Edit</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                )}
                {multiplayerScorecard && (
                    <>
                        {edit.isEditing ? (
                            <>
                                {selectedEditHole ? (
                                    <>
                                        <EditHoleSheet
                                            holeNumber={selectedEditHole.HoleNumber}
                                            par={selectedEditHole.HolePar}
                                            strokes={selectedEditHole.Score}
                                            firstPutt={edit.puttingStats?.firstPutt?.toString() ?? ''}
                                            secondPutt={edit.puttingStats?.secondPutt?.toString() ?? ''}
                                            greenInRegulation={edit.puttingStats?.greenInRegulation ?? false}
                                            sins={edit.editedSins ?? INITIAL_SINS}
                                            onBack={() => edit.setSelectedScore(null)}
                                            onParChange={handleParChange}
                                            onStrokesChange={handleStrokesStep}
                                            onFirstPuttChange={(text) => handlePuttText('firstPutt', text)}
                                            onSecondPuttChange={(text) => handlePuttText('secondPutt', text)}
                                            onGreenInRegulationChange={handleGreenInRegulationEdit}
                                            onSinChange={handleSinToggle}
                                            showStats={showStats}
                                             renderFollowUp={(key) => {
                                                 if (key === 'threePutts') return null;
                                                 return (
                                                     <SinDetailsInput
                                                         sins={edit.editedSins ?? INITIAL_SINS}
                                                         only={key}
                                                         clubs={clubDistances}
                                                         selectedOffTeeClub={edit.selectedOffTeeClub}
                                                         onOffTeeClubChange={edit.setSelectedOffTeeClub}
                                                         showOffTeeClubError={edit.sinDetailsClubError}
                                                         selectedPenaltyType={edit.selectedPenaltyType}
                                                         onPenaltyTypeChange={edit.setSelectedPenaltyType}
                                                         showPenaltyTypeError={edit.sinDetailsPenaltyError}
                                                         selectedBogeysClub={edit.selectedBogeysClub}
                                                         onBogeysClubChange={edit.setSelectedBogeysClub}
                                                         showBogeysClubError={edit.sinDetailsBogeysClubError}
                                                         selectedDoubleChipReason={edit.selectedDoubleChipReason}
                                                         onDoubleChipReasonChange={edit.setSelectedDoubleChipReason}
                                                         showDoubleChipReasonError={edit.sinDetailsDoubleChipReasonError}
                                                     />
                                                 );
                                             }}
                                        />
                                    </>
                                ) : (
                                    <EditRoundSheet
                                        courseName={courseName ?? 'Round'}
                                        dateLabel={editRoundDateLabel}
                                        dateValue={shownRoundDate}
                                        onDateChange={setEditedDate}
                                        maximumDate={endOfToday}
                                        holes={editRoundHoles}
                                        total={editRoundTotal}
                                        onHolePress={handleSelectEditHole}
                                        onCancel={handleCancelEdit}
                                        onSave={handleSave}
                                    />
                                )}
                            </>
                        ) : showSummary ? (
                            <>
                                <RoundSummaryCard
                                    holesPlayed={userHoles.length}
                                    totalScore={userHoles.reduce((sum, h) => sum + h.score, 0)}
                                    totalPar={userHoles.reduce((sum, h) => sum + h.par, 0)}
                                    putts={summaryStats.putts}
                                    threePutts={summaryStats.threePutts}
                                    penalties={summaryStats.penalties}
                                    showStats={!round?.IsScoreOnly}
                                />
                                <RoundScoreTable holes={userHoles} sinHoles={sinHoles} onSinPress={handleSinPress} />
                            </>
                        ) : (
                            <Scorecard
                                players={multiplayerScorecard.players}
                                holeScores={displayScores}
                                editable={false}
                                selectedScore={null}
                                onScoreSelect={handleScoreSelect}
                                sinHoles={sinHoles}
                                onSinPress={handleSinPress}
                                scoreBreakdown={round?.IsScoreOnly ? undefined : (scoreBreakdown ?? undefined)}
                            />
                        )}

                        <DeleteRoundSheet
                            visible={edit.showDeleteConfirm}
                            onConfirm={handleConfirmDelete}
                            onCancel={handleCancelDelete}
                        />
                        <ScorecardActionButtons
                            isEditing={edit.isEditing}
                            onDelete={handleDelete}
                        />
                    </>
                )}
                {scorecard && (
                    <RoundScorecard
                        totalScore={scorecard.round.TotalScore}
                        holes={scorecard.holes}
                    />
                )}
            </ScrollView>
        </View>
    );
}

export default function ScorecardScreen() {
    const styles = useStyles();
    const { roundId } = useLocalSearchParams<{ roundId: string }>();
    const width = Dimensions.get('window').width;

    // Page across only the most recent rounds (history is newest-first). Older rounds
    // are rarely revisited, so tapping one from the history list opens it on its own.
    const history = (getAllRoundHistoryService() ?? []).slice(0, MAX_PAGER_ROUNDS);
    const foundIndex = history.findIndex(r => String(r.Id) === roundId);
    const rounds: Round[] = foundIndex >= 0 ? history : [{ Id: Number(roundId) } as Round];
    const initialIndex = foundIndex >= 0 ? foundIndex : 0;
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [editingIds, setEditingIds] = useState<Set<string>>(() => new Set());

    const handleEditingChange = useCallback((id: string, isEditing: boolean) => {
        setEditingIds(prev => {
            if (isEditing === prev.has(id)) return prev;
            const next = new Set(prev);
            if (isEditing) next.add(id); else next.delete(id);
            return next;
        });
    }, []);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        if (index !== activeIndex) setActiveIndex(index);
    };

    return (
        <GestureHandlerRootView style={styles.scrollContainer}>
            <FlatList<Round>
                testID="scorecard-pager"
                style={styles.flexOne}
                data={rounds}
                keyExtractor={(r) => String(r.Id)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={editingIds.size === 0}
                initialScrollIndex={initialIndex > 0 ? initialIndex : undefined}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
                onMomentumScrollEnd={onScroll}
                renderItem={({ item }) => (
                    <ScorecardPage roundId={String(item.Id)} width={width} onEditingChange={handleEditingChange} />
                )}
            />
            {rounds.length > 1 && (
                <View style={styles.pagerDotRow}>
                    {rounds.map((r, i) => (
                        <View
                            key={String(r.Id)}
                            testID={`scorecard-indicator-${i}`}
                            style={[styles.pagerDot, i === activeIndex && styles.pagerDotActive]}
                        />
                    ))}
                </View>
            )}
        </GestureHandlerRootView>
    );
}
