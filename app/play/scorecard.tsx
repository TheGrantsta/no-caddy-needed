import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import RoundScorecard from '../../components/RoundScorecard';
import MultiplayerScorecard from '../../components/MultiplayerScorecard';
import ScoreEditor from '../../components/ScoreEditor';
import Tiger5Chart from '../../components/Tiger5Chart';
import {
    getRoundScorecardService,
    getMultiplayerScorecardService,
    updateScorecardService,
    getTiger5ForRoundService,
    deleteRoundService,
    RoundHoleScore,
    MultiplayerRoundScorecard,
    RoundScorecard as RoundScorecardType,
    Tiger5Round,
} from '../../service/DbService';
import styles from '../../assets/stlyes';
import colours from '@/assets/colours';
import fontSizes from '@/assets/font-sizes';

export default function ScorecardScreen() {
    const { roundId } = useLocalSearchParams<{ roundId: string }>();
    const toast = useToast();
    const router = useRouter();

    const [multiplayerScorecard, setMultiplayerScorecard] = useState<MultiplayerRoundScorecard | null>(null);
    const [scorecard, setScorecard] = useState<RoundScorecardType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedScores, setEditedScores] = useState<RoundHoleScore[]>([]);
    const [selectedScore, setSelectedScore] = useState<{ holeNumber: number; playerId: number } | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [tiger5Round, setTiger5Round] = useState<Tiger5Round | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const mp = getMultiplayerScorecardService(Number(roundId));
        setMultiplayerScorecard(mp);
        const sc = mp ? null : getRoundScorecardService(Number(roundId));
        setScorecard(sc);
        const round = mp?.round || sc?.round;
        if (round) {
            setTiger5Round(getTiger5ForRoundService(round.Created_At));
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
    };

    const handleScoreSelect = (holeNumber: number, playerId: number) => {
        setSelectedScore({ holeNumber, playerId });
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
            toast.show('Scorecard updated', { type: 'success' });
            loadData();
            setIsEditing(false);
            setEditedScores([]);
            setSelectedScore(null);
            setShowSaveConfirm(false);
        } else {
            toast.show('Failed to update scorecard', { type: 'danger' });
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
        if (success) {
            toast.show('Round deleted', {
                type: 'success',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.green, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
            router.back();
        } else {
            toast.show('Failed to delete round', {
                type: 'danger',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.errorText, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
            setShowDeleteConfirm(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

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
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Scorecard</Text>
                </View>
                {multiplayerScorecard && (
                    <>
                        <MultiplayerScorecard
                            round={multiplayerScorecard.round}
                            players={multiplayerScorecard.players}
                            holeScores={displayScores}
                            editable={isEditing}
                            selectedScore={selectedScore}
                            onScoreSelect={handleScoreSelect}
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
                                    style={[styles.largeButton, { backgroundColor: '#fd0303' }]}
                                    onPress={handleDelete}
                                >
                                    <Text style={styles.buttonText}>Delete round</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isEditing && !showDeleteConfirm && tiger5Round && (
                            <Tiger5Chart rounds={[tiger5Round]} />
                        )}

                        {!isEditing && showDeleteConfirm && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    testID="cancel-delete-button"
                                    style={styles.button}
                                    onPress={handleCancelDelete}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="confirm-delete-button"
                                    style={[styles.button, { backgroundColor: '#fd0303' }]}
                                    onPress={handleConfirmDelete}
                                >
                                    <Text style={styles.buttonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {isEditing && !showSaveConfirm && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    testID="cancel-edit-button"
                                    style={[styles.button, { backgroundColor: '#fd0303' }]}
                                    onPress={handleCancelEdit}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="save-scorecard-button"
                                    style={styles.button}
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
                                    style={[styles.button, { backgroundColor: '#fd0303' }]}
                                    onPress={handleCancelSave}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="confirm-save-button"
                                    style={styles.button}
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
                        coursePar={scorecard.round.CoursePar}
                        holes={scorecard.holes}
                    />
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}
