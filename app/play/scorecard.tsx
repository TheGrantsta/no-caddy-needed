import { useState, useEffect, useCallback } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RoundScorecard from '../../components/RoundScorecard';
import Scorecard from '../../components/Scorecard';
import ScoreEditor from '../../components/ScoreEditor';
import SinEditPanel from '../../components/SinEditPanel';
import ScorecardActionButtons from '../../components/ScorecardActionButtons';
import CtaButton from '../../components/CtaButton';
import { useAppToast } from '../../hooks/useAppToast';
import { useScorecardEdit } from '../../hooks/useScorecardEdit';
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
    const [sinHoles, setSinHoles] = useState<Set<number>>(new Set());
    const [scoreBreakdown, setScoreBreakdown] = useState<RoundScoreBreakdown | null>(null);
    const [clubDistances, setClubDistances] = useState<ClubDistance[]>([]);

    const edit = useScorecardEdit();

    useEffect(() => {
        loadData();
    }, []);

    // Report edit state up so the pager can lock horizontal swiping. Called from the
    // edit/cancel/save handlers (user actions) rather than an effect, so it never fires
    // on mount (which would schedule a pager state update outside test act() blocks).
    const setEditing = (editing: boolean) => {
        edit.setIsEditing(editing);
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
            edit.setEditedScores([...multiplayerScorecard.holeScores.map(s => ({ ...s }))]);
            setEditing(true);
            edit.setSelectedScore(null);
            edit.setShowSaveConfirm(false);
        }
    };

    const handleCancelEdit = () => {
        edit.resetEditState();
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
            } : null);
            edit.setHadPriorPuttingStats(!!existingPuttingStats);
        } else {
            edit.setEditedSins(null);
            edit.setSinsHoleNumber(null);
            edit.setSelectedOffTeeClub(undefined);
            edit.setSelectedPenaltyType(undefined);
            edit.setSelectedBogeysClub(undefined);
            edit.setSelectedDoubleChipReason(undefined);
            edit.setHadPriorSinDetails(false);
            edit.setSinDetailsClubError(false);
            edit.setSinDetailsPenaltyError(false);
            edit.setSinDetailsBogeysClubError(false);
            edit.setSinDetailsDoubleChipReasonError(false);
            edit.setPuttingStats(null);
            edit.setHadPriorPuttingStats(false);
        }
    };

    const handleSinsChange = (values: DeadlySinsValues) => edit.setEditedSins(values);

    // Reveal which deadly sin(s) were logged on a hole when its dot is tapped.
    const handleSinPress = (holeNumber: number) => {
        const sins = getHoleDeadlySinsService(Number(roundId), holeNumber);
        const names = sins ? SIN_LABELS.filter(({ key }) => sins[key]).map(({ label }) => label) : [];
        showError(names.length > 0
            ? `Hole ${holeNumber}: ${names.join(', ')}`
            : `Hole ${holeNumber}: deadly sin logged`);
    };

    const getSelectedScoreValue = (): number => {
        if (!edit.selectedScore) return 0;
        const score = edit.editedScores.find(
            s => s.HoleNumber === edit.selectedScore.holeNumber && s.RoundPlayerId === edit.selectedScore.playerId
        );
        return score ? score.Score : 0;
    };

    const getSelectedPlayerName = (): string => {
        if (!edit.selectedScore || !multiplayerScorecard) return '';
        const player = multiplayerScorecard.players.find(p => p.Id === edit.selectedScore.playerId);
        return player ? player.PlayerName : '';
    };

    const getSelectedHolePar = (): number => {
        if (!edit.selectedScore) return 4;
        const score = edit.editedScores.find(s => s.HoleNumber === edit.selectedScore.holeNumber);
        return score ? score.HolePar : 4;
    };

    const handleParChange = (holePar: number) => {
        if (!edit.selectedScore) return;
        edit.setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === edit.selectedScore.holeNumber ? { ...s, HolePar: holePar } : s
            )
        );
    };

    const handleIncrement = () => {
        if (!edit.selectedScore) return;
        edit.setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === edit.selectedScore.holeNumber && s.RoundPlayerId === edit.selectedScore.playerId
                    ? { ...s, Score: s.Score + 1 }
                    : s
            )
        );
    };

    const handleDecrement = () => {
        if (!edit.selectedScore) return;
        edit.setEditedScores(prev =>
            prev.map(s =>
                s.HoleNumber === edit.selectedScore.holeNumber && s.RoundPlayerId === edit.selectedScore.playerId
                    ? { ...s, Score: Math.max(1, s.Score - 1) }
                    : s
            )
        );
    };

    const handleSave = () => {
        if (edit.sinsHoleNumber !== null && edit.editedSins !== null) {
            const needsClub = edit.editedSins.troubleOffTee && clubDistances.length > 0;
            const needsPenalty = edit.editedSins.penalties;
            const needsBogeysClub = edit.editedSins.bogeysInside9Iron && clubDistances.length > 0;
            const needsDoubleChipReason = edit.editedSins.doubleChips;

            const isValid = edit.validateSinDetails(clubDistances, needsClub, needsPenalty, needsBogeysClub, needsDoubleChipReason);
            if (!isValid) return;
        }
        edit.setShowSaveConfirm(true);
    };

    const handleConfirmSave = async () => {
        if (!multiplayerScorecard) return;

        const changes: { id: number; score: number }[] = [];
        edit.editedScores.forEach(edited => {
            const original = multiplayerScorecard.holeScores.find(o => o.Id === edited.Id);
            if (original && original.Score !== edited.Score) {
                changes.push({ id: edited.Id, score: edited.Score });
            }
        });

        const parChanges: { holeNumber: number; holePar: number }[] = [];
        const processedHoles = new Set<number>();
        edit.editedScores.forEach(edited => {
            const original = multiplayerScorecard.holeScores.find(o => o.Id === edited.Id);
            if (original && original.HolePar !== edited.HolePar && !processedHoles.has(edited.HoleNumber)) {
                parChanges.push({ holeNumber: edited.HoleNumber, holePar: edited.HolePar });
                processedHoles.add(edited.HoleNumber);
            }
        });

        const success = await updateScorecardService(Number(roundId), changes, parChanges);

        if (success) {
            if (edit.sinsHoleNumber !== null && edit.editedSins !== null) {
                await replaceHoleDeadlySinsService(Number(roundId), edit.sinsHoleNumber, edit.editedSins);
                const needsSinDetails = edit.editedSins.troubleOffTee || edit.editedSins.penalties || edit.editedSins.bogeysInside9Iron || edit.editedSins.doubleChips;
                if (needsSinDetails) {
                    await replaceHoleSinDetailsService(Number(roundId), edit.sinsHoleNumber, {
                        troubleOffTeeClub: edit.selectedOffTeeClub,
                        penaltyType: edit.selectedPenaltyType,
                        bogeysInside9IronClub: edit.selectedBogeysClub,
                        doubleChipsReason: edit.selectedDoubleChipReason,
                    });
                } else if (edit.hadPriorSinDetails) {
                    await deleteHoleSinDetailsService(Number(roundId), edit.sinsHoleNumber);
                }
            }
            if (edit.sinsHoleNumber !== null && edit.puttingStats) {
                await insertPuttingStatsService(Number(roundId), edit.sinsHoleNumber, edit.puttingStats.firstPutt ?? 0, edit.puttingStats.secondPutt ?? 0, edit.puttingStats.secondIsLong);
            } else if (edit.sinsHoleNumber !== null && edit.hadPriorPuttingStats && !edit.puttingStats) {
                // Putting stats were cleared - they're already deleted by insertPuttingStatsService when stats exist
                // No-op here; just document the behavior
            }
            showResult(success, 'Scorecard updated', 'Failed to update scorecard');
            loadData();
            edit.resetScorecardAfterSave();
        } else {
            showResult(success, 'Scorecard updated', 'Failed to update scorecard');
            edit.setShowSaveConfirm(false);
        }
    };

    const handleCancelSave = () => {
        edit.setShowSaveConfirm(false);
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
                            editable={edit.isEditing}
                            selectedScore={edit.selectedScore}
                            onScoreSelect={handleScoreSelect}
                            sinHoles={sinHoles}
                            onSinPress={handleSinPress}
                            scoreBreakdown={round?.IsScoreOnly ? undefined : (scoreBreakdown ?? undefined)}
                        />

                        {edit.isEditing && !edit.selectedScore && (
                            <View style={[styles.headerContainer, { paddingVertical: 16 }]}>
                                <Text style={{ color: colours.text, fontSize: 16, fontWeight: '600' }}>Select the score to be amended</Text>
                            </View>
                        )}

                        {edit.isEditing && edit.selectedScore && (
                            <ScoreEditor
                                holeNumber={edit.selectedScore.holeNumber}
                                playerName={getSelectedPlayerName()}
                                score={getSelectedScoreValue()}
                                holePar={getSelectedHolePar()}
                                onIncrement={handleIncrement}
                                onDecrement={handleDecrement}
                                onParChange={handleParChange}
                            />
                        )}

                        {edit.isEditing && edit.selectedScore && edit.editedSins && (
                            <SinEditPanel
                                selectedHoleNumber={edit.selectedScore.holeNumber}
                                holePar={edit.editedScores.find(s => s.HoleNumber === edit.selectedScore.holeNumber)?.HolePar ?? 4}
                                editedSins={edit.editedSins}
                                onSinsChange={handleSinsChange}
                                clubDistances={clubDistances}
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
                                puttingStats={edit.puttingStats}
                                onPuttingStatsChange={(firstPutt, secondPutt, secondIsLong) => {
                                    edit.setPuttingStats(firstPutt !== undefined ? { firstPutt, secondPutt, secondIsLong: secondIsLong ?? false } : null);
                                }}
                                initialFirstPutt={edit.puttingStats?.firstPutt}
                                initialSecondPutt={edit.puttingStats?.secondPutt}
                                initialSecondIsLong={edit.puttingStats?.secondIsLong ?? false}
                                editedScores={edit.editedScores}
                                playerId={multiplayerScorecard?.players.find(p => p.Id === edit.selectedScore.playerId)?.Id}
                            />
                        )}

                        <ScorecardActionButtons
                            isEditing={edit.isEditing}
                            showSaveConfirm={edit.showSaveConfirm}
                            showDeleteConfirm={edit.showDeleteConfirm}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCancelEdit={handleCancelEdit}
                            onSave={handleSave}
                            onCancelSave={handleCancelSave}
                            onConfirmSave={handleConfirmSave}
                            onCancelDelete={handleCancelDelete}
                            onConfirmDelete={handleConfirmDelete}
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
