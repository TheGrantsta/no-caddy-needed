import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    RoundHoleScore,
    MultiplayerRoundScorecard,
    RoundScorecard as RoundScorecardType,
    DeadlySinsValues,
} from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import fontSizes from '@/assets/font-sizes';

const INITIAL_SINS: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

export default function ScorecardScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const { roundId } = useLocalSearchParams<{ roundId: string }>();
    const { showResult } = useAppToast();
    const router = useRouter();

    const [multiplayerScorecard, setMultiplayerScorecard] = useState<MultiplayerRoundScorecard | null>(null);
    const [scorecard, setScorecard] = useState<RoundScorecardType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedScores, setEditedScores] = useState<RoundHoleScore[]>([]);
    const [selectedScore, setSelectedScore] = useState<{ holeNumber: number; playerId: number } | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editedSins, setEditedSins] = useState<DeadlySinsValues | null>(null);
    const [sinsHoleNumber, setSinsHoleNumber] = useState<number | null>(null);
    const [sinHoles, setSinHoles] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const mp = getMultiplayerScorecardService(Number(roundId));
        setMultiplayerScorecard(mp);
        const sc = mp ? null : getRoundScorecardService(Number(roundId));
        setScorecard(sc);
        setSinHoles(getHolesWithSinsForRoundService(Number(roundId)));
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
        const existing = getHoleDeadlySinsService(Number(roundId), holeNumber);
        setEditedSins(existing ?? INITIAL_SINS);
        setSinsHoleNumber(holeNumber);
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

        const success = await updateScorecardService(Number(roundId), changes);

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
            <GestureHandlerRootView style={styles.flexOne}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Round not found</Text>
                </View>
            </GestureHandlerRootView>
        );
    }

    const displayScores = isEditing ? editedScores : multiplayerScorecard?.holeScores || [];

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Scorecard</Text>
                    {courseName && (
                        <Text testID="scorecard-course-name" style={styles.subHeaderText}>
                            {round?.Created_At ? `${courseName} (${round.Created_At})` : courseName}
                        </Text>
                    )}
                </View>
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
                                onIncrement={handleIncrement}
                                onDecrement={handleDecrement}
                            />
                        )}

                        {isEditing && selectedScore && editedSins && (
                            <DeadlySinsTally
                                onEndRound={() => {}}
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
                                    testID="analyse-round-button"
                                    style={styles.largeButton}
                                    onPress={() => router.push({ pathname: '/play/round-analysis', params: { roundId } })}
                                >
                                    <Text style={styles.buttonText}>Analyse round</Text>
                                </TouchableOpacity>
                            </View>
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
        </GestureHandlerRootView>
    );
}
