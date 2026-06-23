import { useState, useEffect, useCallback } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RoundScorecard from '../../components/RoundScorecard';
import Scorecard from '../../components/Scorecard';
import ScoreEditor from '../../components/ScoreEditor';
import DeadlySinsTally from '../../components/DeadlySinsTally';
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
    RoundHoleScore,
    MultiplayerRoundScorecard,
    RoundScorecard as RoundScorecardType,
    DeadlySinsValues,
    Round,
} from '../../service/DbService';
import Constants from 'expo-constants';
import { checkPremiumEntitlement } from '../../service/SubscriptionService';
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
    const { showResult } = useAppToast();
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
    const analyseRoundEnabled = Constants.expoConfig?.extra?.analyseRoundEnabled ?? false;

    useEffect(() => {
        loadData();
    }, []);

    // Report edit state up so the pager can lock horizontal swiping during edits.
    useEffect(() => {
        onEditingChange(roundId, isEditing);
    }, [isEditing, roundId, onEditingChange]);

    const loadData = () => {
        const mp = getMultiplayerScorecardService(Number(roundId));
        setMultiplayerScorecard(mp);
        const sc = mp ? null : getRoundScorecardService(Number(roundId));
        setScorecard(sc);
        setSinHoles(getHolesWithSinsForRoundService(Number(roundId)));
        const courseName = mp?.round?.CourseName ?? sc?.round?.CourseName ?? null;
        if (courseName) {
            setCourseNotes(loadCourseNotesService(courseName));
        }
    };

    const handleEdit = () => {
        if (multiplayerScorecard) {
            setEditedScores([...multiplayerScorecard.holeScores.map(s => ({ ...s }))]);
            setIsEditing(true);
            setSelectedScore(null);
            setShowSaveConfirm(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedScores([]);
        setSelectedScore(null);
        setShowSaveConfirm(false);
        setEditedSins(null);
        setSinsHoleNumber(null);
    };

    const handleScoreSelect = (holeNumber: number, playerId: number) => {
        setSelectedScore({ holeNumber, playerId });
        const isUserPlayer = multiplayerScorecard?.players.find(p => p.Id === playerId)?.IsUser === 1;
        if (isUserPlayer) {
            const existing = getHoleDeadlySinsService(Number(roundId), holeNumber);
            setEditedSins(existing ?? INITIAL_SINS);
            setSinsHoleNumber(holeNumber);
        } else {
            setEditedSins(null);
            setSinsHoleNumber(null);
        }
    };

    const handleSinsChange = (values: DeadlySinsValues) => setEditedSins(values);

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
            }
            showResult(success, 'Scorecard updated', 'Failed to update scorecard');
            loadData();
            setIsEditing(false);
            setEditedScores([]);
            setSelectedScore(null);
            setShowSaveConfirm(false);
            setEditedSins(null);
            setSinsHoleNumber(null);
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
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
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
                        />

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

                        {!isEditing && !showDeleteConfirm && (
                            <View style={styles.headerContainer}>
                                <TouchableOpacity
                                    testID="edit-scorecard-button"
                                    style={styles.largeButton}
                                    onPress={handleEdit}
                                >
                                    <Text style={styles.buttonText}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isEditing && !showDeleteConfirm && (
                            <View style={styles.headerContainer}>
                                <TouchableOpacity
                                    testID="delete-round-button"
                                    style={[styles.largeButton, { backgroundColor: colours.red }]}
                                    onPress={handleDelete}
                                >
                                    <Text style={styles.buttonText}>Delete round</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {analyseRoundEnabled && !isEditing && !showDeleteConfirm && (
                            <View style={styles.headerContainer}>
                                <TouchableOpacity
                                    testID="analyse-round-button"
                                    style={[styles.largeButton, { backgroundColor: colours.tertiary }]}
                                    onPress={async () => {
                                        const isPremium = await checkPremiumEntitlement();
                                        if (isPremium) {
                                            router.push({ pathname: '/play/round-analysis', params: { roundId } });
                                        } else {
                                            router.push({ pathname: '/play/premium-paywall', params: { roundId } });
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>Analyse your round</Text>
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

    // Page across the round-history list, starting on the requested round. If that
    // round isn't in the list (stale/empty history), fall back to showing it alone.
    const history = getAllRoundHistoryService() ?? [];
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
                initialScrollIndex={initialIndex}
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
