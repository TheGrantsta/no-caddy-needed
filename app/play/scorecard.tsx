import { useState, useEffect, useCallback } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RoundScorecard from '../../components/RoundScorecard';
import Scorecard from '../../components/Scorecard';
import ScoreEditor from '../../components/ScoreEditor';
import DeadlySinsTally from '../../components/DeadlySinsTally';
import SinDetailsInput from '../../components/SinDetailsInput';
import PuttingStatsInput from '../../components/PuttingStatsInput';
import CtaButton from '../../components/CtaButton';
import { useAppToast } from '../../hooks/useAppToast';
import {
    getRoundScorecardService,
    getMultiplayerScorecardService,
    updateScorecardService,
    deleteRoundService,
    getHoleDeadlySinsService,
    replaceHoleDeadlySinsService,
    getHolesWithSinsForRoundService,
    loadCourseNotesService,
    getAllRoundHistoryService,
    getRoundScoreBreakdownService,
    getClubDistancesService,
    getHoleSinDetailsService,
    replaceHoleSinDetailsService,
    deleteHoleSinDetailsService,
    getPuttingStatsService,
    insertPuttingStatsService,
    RoundHoleScore,
    MultiplayerRoundScorecard,
    RoundScorecard as RoundScorecardType,
    DeadlySinsValues,
    Round,
    RoundScoreBreakdown,
    ClubDistance,
    HoleSinDetailsInput,
    PuttingStats,
} from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
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
    const { showResult, showError } = useAppToast();
    const router = useRouter();

    const [multiplayerScorecard, setMultiplayerScorecard] = useState<MultiplayerRoundScorecard | null>(null);
    const [scorecard, setScorecard] = useState<RoundScorecardType | null>(null);
    const [, setCourseNotes] = useState<Record<number, string>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editedScores, setEditedScores] = useState<RoundHoleScore[]>([]);
    const [selectedScore, setSelectedScore] = useState<{ holeNumber: number; playerId: number } | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editedSins, setEditedSins] = useState<DeadlySinsValues | null>(null);
    const [sinsHoleNumber, setSinsHoleNumber] = useState<number | null>(null);
    const [sinHoles, setSinHoles] = useState<Set<number>>(new Set());
    const [scoreBreakdown, setScoreBreakdown] = useState<RoundScoreBreakdown | null>(null);
    const [clubDistances, setClubDistances] = useState<ClubDistance[]>([]);
    const [selectedOffTeeClub, setSelectedOffTeeClub] = useState<string | undefined>(undefined);
    const [selectedPenaltyType, setSelectedPenaltyType] = useState<string | undefined>(undefined);
    const [selectedBogeysClub, setSelectedBogeysClub] = useState<string | undefined>(undefined);
    const [selectedDoubleChipReason, setSelectedDoubleChipReason] = useState<string | undefined>(undefined);
    const [sinDetailsClubError, setSinDetailsClubError] = useState(false);
    const [sinDetailsPenaltyError, setSinDetailsPenaltyError] = useState(false);
    const [sinDetailsBogeysClubError, setSinDetailsBogeysClubError] = useState(false);
    const [sinDetailsDoubleChipReasonError, setSinDetailsDoubleChipReasonError] = useState(false);
    const [hadPriorSinDetails, setHadPriorSinDetails] = useState(false);
    const [puttingStats, setPuttingStats] = useState<{ firstPutt?: number; secondPutt?: number; secondIsLong: boolean } | null>(null);
    const [hadPriorPuttingStats, setHadPriorPuttingStats] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    // Report edit state up so the pager can lock horizontal swiping. Called from the
    // edit/cancel/save handlers (user actions) rather than an effect, so it never fires
    // on mount (which would schedule a pager state update outside test act() blocks).
    const setEditing = (editing: boolean) => {
        setIsEditing(editing);
        onEditingChange(roundId, editing);
    };

    const loadData = () => {
        const mp = getMultiplayerScorecardService(Number(roundId));
        setMultiplayerScorecard(mp);
        const sc = mp ? null : getRoundScorecardService(Number(roundId));
        setScorecard(sc);
        setSinHoles(getHolesWithSinsForRoundService(Number(roundId)));
        setScoreBreakdown(getRoundScoreBreakdownService(Number(roundId)));
        setClubDistances(getClubDistancesService());
        const courseName = mp?.round?.CourseName ?? sc?.round?.CourseName ?? null;
        if (courseName) {
            setCourseNotes(loadCourseNotesService(courseName));
        }
    };

    const handleEdit = () => {
        if (multiplayerScorecard) {
            setEditedScores([...multiplayerScorecard.holeScores.map(s => ({ ...s }))]);
            setEditing(true);
            setSelectedScore(null);
            setShowSaveConfirm(false);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditedScores([]);
        setSelectedScore(null);
        setShowSaveConfirm(false);
        setEditedSins(null);
        setSinsHoleNumber(null);
        setSelectedOffTeeClub(undefined);
        setSelectedPenaltyType(undefined);
        setSelectedBogeysClub(undefined);
        setSelectedDoubleChipReason(undefined);
        setHadPriorSinDetails(false);
        setSinDetailsClubError(false);
        setSinDetailsPenaltyError(false);
        setSinDetailsBogeysClubError(false);
        setSinDetailsDoubleChipReasonError(false);
        setPuttingStats(null);
        setHadPriorPuttingStats(false);
    };

    const handleScoreSelect = (holeNumber: number, playerId: number) => {
        setSelectedScore({ holeNumber, playerId });
        const isUserPlayer = multiplayerScorecard?.players.find(p => p.Id === playerId)?.IsUser === 1;
        const isScoreOnlyRound = multiplayerScorecard?.round.IsScoreOnly === 1;
        if (isUserPlayer && !isScoreOnlyRound) {
            const existing = getHoleDeadlySinsService(Number(roundId), holeNumber);
            setEditedSins(existing ?? INITIAL_SINS);
            setSinsHoleNumber(holeNumber);
            const existingDetails = getHoleSinDetailsService(Number(roundId), holeNumber);
            setSelectedOffTeeClub(existingDetails?.TroubleOffTeeClub);
            setSelectedPenaltyType(existingDetails?.PenaltyType);
            setSelectedBogeysClub(existingDetails?.BogeysInside9IronClub);
            setSelectedDoubleChipReason(existingDetails?.DoubleChipsReason);
            setHadPriorSinDetails(!!existingDetails);
            setSinDetailsClubError(false);
            setSinDetailsPenaltyError(false);
            setSinDetailsBogeysClubError(false);
            setSinDetailsDoubleChipReasonError(false);
            const existingPuttingStats = getPuttingStatsService(Number(roundId), holeNumber);
            setPuttingStats(existingPuttingStats ? {
                firstPutt: existingPuttingStats.FirstPuttDistance,
                secondPutt: existingPuttingStats.SecondPuttDistance || undefined,
                secondIsLong: !!existingPuttingStats.SecondPuttIsLong,
            } : null);
            setHadPriorPuttingStats(!!existingPuttingStats);
        } else {
            setEditedSins(null);
            setSinsHoleNumber(null);
            setSelectedOffTeeClub(undefined);
            setSelectedPenaltyType(undefined);
            setSelectedBogeysClub(undefined);
            setSelectedDoubleChipReason(undefined);
            setHadPriorSinDetails(false);
            setSinDetailsClubError(false);
            setSinDetailsPenaltyError(false);
            setSinDetailsBogeysClubError(false);
            setSinDetailsDoubleChipReasonError(false);
            setPuttingStats(null);
            setHadPriorPuttingStats(false);
        }
    };

    const handleSinsChange = (values: DeadlySinsValues) => setEditedSins(values);

    // Reveal which deadly sin(s) were logged on a hole when its dot is tapped.
    const handleSinPress = (holeNumber: number) => {
        const sins = getHoleDeadlySinsService(Number(roundId), holeNumber);
        const names = sins ? SIN_LABELS.filter(({ key }) => sins[key]).map(({ label }) => label) : [];
        showError(names.length > 0
            ? `Hole ${holeNumber}: ${names.join(', ')}`
            : `Hole ${holeNumber}: deadly sin logged`);
    };

    const getSelectedScoreValue = (): number => {
        if (!selectedScore) return 0;
        const score = editedScores.find(
            s => s.HoleNumber === selectedScore.holeNumber && s.RoundPlayerId === selectedScore.playerId
        );
        return score ? score.Score : 0;
    };

    const getSelectedPlayerName = (): string => {
        if (!selectedScore || !multiplayerScorecard) return '';
        const player = multiplayerScorecard.players.find(p => p.Id === selectedScore.playerId);
        return player ? player.PlayerName : '';
    };

    const getSelectedHolePar = (): number => {
        if (!selectedScore) return 4;
        const score = editedScores.find(s => s.HoleNumber === selectedScore.holeNumber);
        return score ? score.HolePar : 4;
    };

    const handleParChange = (holePar: number) => {
        if (!selectedScore) return;
        setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === selectedScore.holeNumber ? { ...s, HolePar: holePar } : s
            )
        );
    };

    const handleIncrement = () => {
        if (!selectedScore) return;
        setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === selectedScore.holeNumber && s.RoundPlayerId === selectedScore.playerId
                    ? { ...s, Score: s.Score + 1 }
                    : s
            )
        );
    };

    const handleDecrement = () => {
        if (!selectedScore) return;
        setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === selectedScore.holeNumber && s.RoundPlayerId === selectedScore.playerId
                    ? { ...s, Score: Math.max(1, s.Score - 1) }
                    : s
            )
        );
    };

    const handleSave = () => {
        if (sinsHoleNumber !== null && editedSins !== null) {
            const needsClub = editedSins.troubleOffTee && clubDistances.length > 0;
            const needsPenalty = editedSins.penalties;
            const needsBogeysClub = editedSins.bogeysInside9Iron && clubDistances.length > 0;
            const needsDoubleChipReason = editedSins.doubleChips;
            let blocked = false;

            if (needsClub && !selectedOffTeeClub) { setSinDetailsClubError(true); blocked = true; } else setSinDetailsClubError(false);
            if (needsPenalty && !selectedPenaltyType) { setSinDetailsPenaltyError(true); blocked = true; } else setSinDetailsPenaltyError(false);
            if (needsBogeysClub && !selectedBogeysClub) { setSinDetailsBogeysClubError(true); blocked = true; } else setSinDetailsBogeysClubError(false);
            if (needsDoubleChipReason && !selectedDoubleChipReason) { setSinDetailsDoubleChipReasonError(true); blocked = true; } else setSinDetailsDoubleChipReasonError(false);

            if (blocked) return;
        }
        setShowSaveConfirm(true);
    };

    const handleConfirmSave = async () => {
        if (!multiplayerScorecard) return;

        const changes: { id: number; score: number }[] = [];
        editedScores.forEach(edited => {
            const original = multiplayerScorecard.holeScores.find(o => o.Id === edited.Id);
            if (original && original.Score !== edited.Score) {
                changes.push({ id: edited.Id, score: edited.Score });
            }
        });

        const parChanges: { holeNumber: number; holePar: number }[] = [];
        const processedHoles = new Set<number>();
        editedScores.forEach(edited => {
            const original = multiplayerScorecard.holeScores.find(o => o.Id === edited.Id);
            if (original && original.HolePar !== edited.HolePar && !processedHoles.has(edited.HoleNumber)) {
                parChanges.push({ holeNumber: edited.HoleNumber, holePar: edited.HolePar });
                processedHoles.add(edited.HoleNumber);
            }
        });

        const success = await updateScorecardService(Number(roundId), changes, parChanges);

        if (success) {
            if (sinsHoleNumber !== null && editedSins !== null) {
                await replaceHoleDeadlySinsService(Number(roundId), sinsHoleNumber, editedSins);
                const needsSinDetails = editedSins.troubleOffTee || editedSins.penalties || editedSins.bogeysInside9Iron || editedSins.doubleChips;
                if (needsSinDetails) {
                    await replaceHoleSinDetailsService(Number(roundId), sinsHoleNumber, {
                        troubleOffTeeClub: selectedOffTeeClub,
                        penaltyType: selectedPenaltyType,
                        bogeysInside9IronClub: selectedBogeysClub,
                        doubleChipsReason: selectedDoubleChipReason,
                    });
                } else if (hadPriorSinDetails) {
                    await deleteHoleSinDetailsService(Number(roundId), sinsHoleNumber);
                }
            }
            if (sinsHoleNumber !== null && puttingStats) {
                await insertPuttingStatsService(Number(roundId), sinsHoleNumber, puttingStats.firstPutt ?? 0, puttingStats.secondPutt ?? 0, puttingStats.secondIsLong);
            } else if (sinsHoleNumber !== null && hadPriorPuttingStats && !puttingStats) {
                // Putting stats were cleared - they're already deleted by insertPuttingStatsService when stats exist
                // No-op here; just document the behavior
            }
            showResult(success, 'Scorecard updated', 'Failed to update scorecard');
            loadData();
            setEditing(false);
            setEditedScores([]);
            setSelectedScore(null);
            setShowSaveConfirm(false);
            setEditedSins(null);
            setSinsHoleNumber(null);
            setSelectedOffTeeClub(undefined);
            setSelectedPenaltyType(undefined);
            setSelectedBogeysClub(undefined);
            setSelectedDoubleChipReason(undefined);
            setHadPriorSinDetails(false);
            setSinDetailsClubError(false);
            setSinDetailsPenaltyError(false);
            setSinDetailsBogeysClubError(false);
            setSinDetailsDoubleChipReasonError(false);
            setPuttingStats(null);
            setHadPriorPuttingStats(false);
        } else {
            showResult(success, 'Scorecard updated', 'Failed to update scorecard');
            setShowSaveConfirm(false);
        }
    };

    const handleCancelSave = () => {
        setShowSaveConfirm(false);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        const success = await deleteRoundService(Number(roundId));
        showResult(success, 'Round deleted', 'Failed to delete round');
        if (success) {
            router.back();
        } else {
            setShowDeleteConfirm(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const round = multiplayerScorecard?.round || scorecard?.round;
    const courseName = round?.CourseName;

    if (!multiplayerScorecard && !scorecard) {
        return (
            <View testID={`scorecard-page-${roundId}`} style={{ width }}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Round not found</Text>
                </View>
            </View>
        );
    }

    const displayScores = isEditing ? editedScores : multiplayerScorecard?.holeScores || [];

    return (
        <View testID={`scorecard-page-${roundId}`} style={{ width }}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding, { flexGrow: 1, paddingBottom: 24 }]}>
                {courseName && (
                    <View style={styles.headerContainer}>
                        <Text testID="scorecard-course-name" style={styles.subHeaderText}>
                            {round?.Created_At ? `${courseName} (${round.Created_At})` : courseName}
                        </Text>
                    </View>
                )}
                {multiplayerScorecard && (
                    <>
                        <Scorecard
                            players={multiplayerScorecard.players}
                            holeScores={displayScores}
                            editable={isEditing}
                            selectedScore={selectedScore}
                            onScoreSelect={handleScoreSelect}
                            sinHoles={sinHoles}
                            onSinPress={handleSinPress}
                            scoreBreakdown={round?.IsScoreOnly ? undefined : (scoreBreakdown ?? undefined)}
                        />

                        {isEditing && !selectedScore && (
                            <View style={[styles.headerContainer, { paddingVertical: 16 }]}>
                                <Text style={{ color: colours.text, fontSize: 16, fontWeight: '600' }}>Select the score to be amended</Text>
                            </View>
                        )}

                        {isEditing && selectedScore && (
                            <ScoreEditor
                                holeNumber={selectedScore.holeNumber}
                                playerName={getSelectedPlayerName()}
                                score={getSelectedScoreValue()}
                                holePar={getSelectedHolePar()}
                                onIncrement={handleIncrement}
                                onDecrement={handleDecrement}
                                onParChange={handleParChange}
                            />
                        )}

                        {isEditing && selectedScore && editedSins && (
                            <DeadlySinsTally
                                key={selectedScore.holeNumber}
                                onEndRound={() => { }}
                                roundControlled
                                onValuesChange={handleSinsChange}
                                initialValues={editedSins}
                                holePar={editedScores.find(s => s.HoleNumber === selectedScore.holeNumber)?.HolePar}
                                userScore={editedScores.find(s => s.HoleNumber === selectedScore.holeNumber && s.RoundPlayerId === multiplayerScorecard?.players.find(p => p.IsUser === 1)?.Id)?.Score}
                            />
                        )}

                        {isEditing && selectedScore && editedSins && (editedSins.troubleOffTee || editedSins.penalties || editedSins.bogeysInside9Iron || editedSins.doubleChips) && (
                            <SinDetailsInput
                                key={`sin-details-${selectedScore.holeNumber}`}
                                sins={editedSins}
                                clubs={clubDistances}
                                selectedOffTeeClub={selectedOffTeeClub}
                                onOffTeeClubChange={setSelectedOffTeeClub}
                                showOffTeeClubError={sinDetailsClubError}
                                selectedPenaltyType={selectedPenaltyType}
                                onPenaltyTypeChange={setSelectedPenaltyType}
                                showPenaltyTypeError={sinDetailsPenaltyError}
                                selectedBogeysClub={selectedBogeysClub}
                                onBogeysClubChange={setSelectedBogeysClub}
                                showBogeysClubError={sinDetailsBogeysClubError}
                                selectedDoubleChipReason={selectedDoubleChipReason}
                                onDoubleChipReasonChange={setSelectedDoubleChipReason}
                                showDoubleChipReasonError={sinDetailsDoubleChipReasonError}
                            />
                        )}

                        {isEditing && selectedScore && multiplayerScorecard?.players.find(p => p.Id === selectedScore.playerId)?.IsUser === 1 && multiplayerScorecard?.round.IsScoreOnly !== 1 && (
                            <PuttingStatsInput
                                key={`putting-stats-${selectedScore.holeNumber}`}
                                holePar={getSelectedHolePar()}
                                threePuttSelected={editedSins?.threePutts ?? false}
                                onStatsChange={(firstPutt, secondPutt, secondIsLong) => {
                                    setPuttingStats(firstPutt !== undefined ? { firstPutt, secondPutt, secondIsLong } : null);
                                }}
                                initialFirstPutt={puttingStats?.firstPutt}
                                initialSecondPutt={puttingStats?.secondPutt}
                                initialSecondIsLong={puttingStats?.secondIsLong}
                            />
                        )}

                        {/* Action buttons sit at the bottom of the page (spacer fills the gap). */}
                        {!isEditing && !showDeleteConfirm && <View style={{ flexGrow: 1 }} />}

                        {!isEditing && !showDeleteConfirm && (
                            <View style={styles.headerContainer}>
                                <CtaButton
                                    testID="edit-scorecard-button"
                                    label="Edit"
                                    icon="edit"
                                    onPress={handleEdit}
                                />
                            </View>
                        )}

                        {!isEditing && !showDeleteConfirm && (
                            <View style={styles.headerContainer}>
                                <TouchableOpacity
                                    testID="delete-round-button"
                                    style={styles.tertiaryLink}
                                    onPress={handleDelete}
                                >
                                    <MaterialIcons name="delete-outline" size={20} color={colours.red} />
                                    <Text style={styles.tertiaryLinkText}>Delete round</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isEditing && showDeleteConfirm && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    testID="cancel-delete-button"
                                    onPress={handleCancelDelete}
                                    style={[styles.mediumButton, { backgroundColor: colours.red }]}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="confirm-delete-button"
                                    onPress={handleConfirmDelete}
                                    style={styles.mediumButton}
                                >
                                    <Text style={styles.buttonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {isEditing && !showSaveConfirm && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    testID="cancel-edit-button"
                                    style={[styles.mediumButton, { backgroundColor: colours.red }]}
                                    onPress={handleCancelEdit}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="save-scorecard-button"
                                    style={styles.mediumButton}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {showSaveConfirm && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    testID="cancel-save-button"
                                    style={[styles.mediumButton, { backgroundColor: colours.red }]}
                                    onPress={handleCancelSave}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="confirm-save-button"
                                    style={styles.mediumButton}
                                    onPress={handleConfirmSave}
                                >
                                    <Text style={styles.buttonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
