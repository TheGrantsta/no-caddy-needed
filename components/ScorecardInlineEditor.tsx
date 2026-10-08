import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import Scorecard from './Scorecard';
import SinEditPanel from './SinEditPanel';
import { useScorecardEdit } from '../hooks/useScorecardEdit';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { useAppToast } from '../hooks/useAppToast';
import {
    updateScorecardService,
    replaceHoleDeadlySinsService,
    replaceHoleSinDetailsService,
    deleteHoleSinDetailsService,
    insertPuttingStatsService,
    getHoleDeadlySinsService,
    getHoleSinDetailsService,
    getPuttingStatsService,
    getClubDistancesService,
    getHolesWithSinsForRoundService,
    DeadlySinsValues,
} from '../service/DbService';
import { MultiplayerRoundScorecard } from '../service/DbService';
import ScorecardActionButtons from './ScorecardActionButtons';

const INITIAL_SINS: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

type ScorecardInlineEditorProps = {
    roundId: number;
    scorecardData: MultiplayerRoundScorecard;
    onDone: () => void;
    onCancel: () => void;
};

export default function ScorecardInlineEditor({
    roundId,
    scorecardData,
    onDone,
    onCancel,
}: ScorecardInlineEditorProps) {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showResult } = useAppToast();
    const edit = useScorecardEdit();
    const [clubDistances, setClubDistances] = useState<any[]>([]);
    const [sinHoles, setSinHoles] = useState<Set<number>>(new Set());
    const [originalSinsForHole, setOriginalSinsForHole] = useState<DeadlySinsValues | null>(null);

    useEffect(() => {
        // Initialize edit state with current scorecard data
        edit.setEditedScores([...scorecardData.holeScores.map(s => ({ ...s }))]);
        setClubDistances(getClubDistancesService());
        setSinHoles(getHolesWithSinsForRoundService(roundId));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scorecardData.holeScores]);

    const loadScoreDataForHole = (holeNumber: number, playerId: number) => {
        const selectedPlayer = scorecardData.players.find(p => p.Id === playerId);
        const isUserPlayer = selectedPlayer?.IsUser === 1;

        if (isUserPlayer) {
            const sins = getHoleDeadlySinsService(roundId, holeNumber);
            const sinValues = sins || INITIAL_SINS;
            edit.setEditedSins(sinValues);
            setOriginalSinsForHole(sinValues);
            edit.setSinsHoleNumber(holeNumber);
            const existingDetails = getHoleSinDetailsService(roundId, holeNumber);
            edit.setSelectedOffTeeClub(existingDetails?.TroubleOffTeeClub);
            edit.setSelectedPenaltyType(existingDetails?.PenaltyType);
            edit.setSelectedBogeysClub(existingDetails?.BogeysInside9IronClub);
            edit.setSelectedDoubleChipReason(existingDetails?.DoubleChipsReason);
            const existingPuttingStats = getPuttingStatsService(roundId, holeNumber);
            edit.setPuttingStats(existingPuttingStats ? {
                firstPutt: existingPuttingStats.FirstPuttDistance,
                secondPutt: existingPuttingStats.SecondPuttDistance || undefined,
                secondIsLong: !!existingPuttingStats.SecondPuttIsLong,
            } : null);
            edit.setHadPriorPuttingStats(!!existingPuttingStats);
        } else {
            edit.setEditedSins(null);
            setOriginalSinsForHole(null);
            edit.setSinsHoleNumber(null);
            edit.setSelectedOffTeeClub(undefined);
            edit.setSelectedPenaltyType(undefined);
            edit.setSelectedBogeysClub(undefined);
            edit.setSelectedDoubleChipReason(undefined);
            edit.setPuttingStats(null);
        }
    };

    const handleScoreSelect = (holeNumber: number, playerId: number) => {
        if (edit.selectedScore && hasPendingSinEdits()) {
            showResult(false, 'Unsaved edits', 'Save or discard changes before switching holes');
            return;
        }

        edit.setSelectedScore({ holeNumber, playerId });
        loadScoreDataForHole(holeNumber, playerId);
    };

    const handleSinsChange = (values: DeadlySinsValues) => edit.setEditedSins(values);

    const sinsDiffer = (sins1: DeadlySinsValues | null, sins2: DeadlySinsValues | null): boolean => {
        if (!sins1 || !sins2) return sins1 !== sins2;
        return JSON.stringify(sins1) !== JSON.stringify(sins2);
    };

    const hasPendingSinEdits = (): boolean => {
        return sinsDiffer(edit.editedSins, originalSinsForHole);
    };

    const getSelectedScoreValue = (): number => {
        if (!edit.selectedScore) return 0;
        const score = edit.editedScores.find(
            s => s.HoleNumber === edit.selectedScore.holeNumber && s.RoundPlayerId === edit.selectedScore.playerId
        );
        return score ? score.Score : 0;
    };

    const getSelectedPlayerName = (): string => {
        if (!edit.selectedScore) return '';
        const player = scorecardData.players.find(p => p.Id === edit.selectedScore.playerId);
        return player ? player.PlayerName : '';
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
        const changes: { id: number; score: number }[] = [];
        edit.editedScores.forEach(edited => {
            const original = scorecardData.holeScores.find(o => o.Id === edited.Id);
            if (original && original.Score !== edited.Score) {
                changes.push({ id: edited.Id, score: edited.Score });
            }
        });

        const success = await updateScorecardService(roundId, changes, []);

        if (success) {
            if (edit.sinsHoleNumber !== null && edit.editedSins !== null) {
                await replaceHoleDeadlySinsService(roundId, edit.sinsHoleNumber, edit.editedSins);
                const needsSinDetails = edit.editedSins.troubleOffTee || edit.editedSins.penalties || edit.editedSins.bogeysInside9Iron || edit.editedSins.doubleChips;
                if (needsSinDetails) {
                    await replaceHoleSinDetailsService(roundId, edit.sinsHoleNumber, {
                        troubleOffTeeClub: edit.selectedOffTeeClub,
                        penaltyType: edit.selectedPenaltyType,
                        bogeysInside9IronClub: edit.selectedBogeysClub,
                        doubleChipsReason: edit.selectedDoubleChipReason,
                    });
                } else if (edit.hadPriorSinDetails) {
                    await deleteHoleSinDetailsService(roundId, edit.sinsHoleNumber);
                }
            }
            if (edit.sinsHoleNumber !== null && edit.puttingStats) {
                await insertPuttingStatsService(roundId, edit.sinsHoleNumber, edit.puttingStats.firstPutt ?? 0, edit.puttingStats.secondPutt ?? 0, edit.puttingStats.secondIsLong);
            }
            showResult(success, 'Scorecard updated', 'Failed to update scorecard');
            edit.resetScorecardAfterSave();
            onDone();
        } else {
            showResult(success, 'Scorecard updated', 'Failed to update scorecard');
            edit.setShowSaveConfirm(false);
        }
    };

    const handleCancelSave = () => {
        edit.setShowSaveConfirm(false);
    };

    const handleCancelEdit = () => {
        onCancel();
    };

    return (
        <ScrollView style={styles.scrollContainer}>
            <View testID="inline-editor-scorecard">
                <Scorecard
                    players={scorecardData.players}
                    holeScores={edit.editedScores}
                    editable
                    selectedScore={edit.selectedScore}
                    onScoreSelect={handleScoreSelect}
                    sinHoles={sinHoles}
                />
            </View>

            {!edit.selectedScore && (
                <View style={[styles.headerContainer, { paddingVertical: 16 }]}>
                    <Text style={{ color: colours.text, fontSize: 16, fontWeight: '600' }}>Select a score to edit</Text>
                </View>
            )}

            {edit.selectedScore && (
                <View testID="inline-editor-score-editor" style={styles.container}>
                    <Text style={[styles.scoreEditor.headerText]}>#{edit.selectedScore.holeNumber} - {getSelectedPlayerName()}</Text>
                    <View style={[styles.scoreEditor.stepperRow]}>
                        <TouchableOpacity
                            testID="score-editor-decrement"
                            onPress={handleDecrement}
                            style={styles.scoreEditor.stepperButton}
                        >
                            <Text style={styles.scoreEditor.stepperButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text testID="score-editor-value" style={styles.scoreEditor.scoreText}>
                            {getSelectedScoreValue()}
                        </Text>
                        <TouchableOpacity
                            testID="score-editor-increment"
                            onPress={handleIncrement}
                            style={styles.scoreEditor.stepperButton}
                        >
                            <Text style={styles.scoreEditor.stepperButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {edit.selectedScore && edit.editedSins && (
                <View style={styles.container}>
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
                        playerId={scorecardData.players.find(p => p.Id === edit.selectedScore.playerId)?.Id}
                    />
                </View>
            )}

            <View style={styles.container}>
                <ScorecardActionButtons
                    isEditing={true}
                    showSaveConfirm={edit.showSaveConfirm}
                    showDeleteConfirm={false}
                    onEdit={() => { }}
                    onDelete={() => { }}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                    onCancelSave={handleCancelSave}
                    onConfirmSave={handleConfirmSave}
                    onCancelDelete={() => { }}
                    onConfirmDelete={() => { }}
                />
            </View>
        </ScrollView>
    );
}
