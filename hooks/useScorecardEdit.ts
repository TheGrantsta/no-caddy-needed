import { useState, useCallback } from 'react';
import { DeadlySinsValues, RoundHoleScore } from '../service/DbService';

export interface ScorecardEditState {
    isEditing: boolean;
    editedScores: RoundHoleScore[];
    selectedScore: { holeNumber: number; playerId: number } | null;
    showSaveConfirm: boolean;
    showDeleteConfirm: boolean;
    editedSins: DeadlySinsValues | null;
    sinsHoleNumber: number | null;
    selectedOffTeeClub: string | undefined;
    selectedPenaltyType: string | undefined;
    selectedBogeysClub: string | undefined;
    selectedDoubleChipReason: string | undefined;
    sinDetailsClubError: boolean;
    sinDetailsPenaltyError: boolean;
    sinDetailsBogeysClubError: boolean;
    sinDetailsDoubleChipReasonError: boolean;
    hadPriorSinDetails: boolean;
    puttingStats: { firstPutt?: number; secondPutt?: number; secondIsLong: boolean } | null;
    hadPriorPuttingStats: boolean;
}

const INITIAL_SINS: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

export function useScorecardEdit() {
    const [isEditing, setIsEditing] = useState(false);
    const [editedScores, setEditedScores] = useState<RoundHoleScore[]>([]);
    const [selectedScore, setSelectedScore] = useState<{ holeNumber: number; playerId: number } | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editedSins, setEditedSins] = useState<DeadlySinsValues | null>(null);
    const [sinsHoleNumber, setSinsHoleNumber] = useState<number | null>(null);
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

    const resetEditState = useCallback(() => {
        setIsEditing(false);
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
    }, []);

    const resetScorecardAfterSave = useCallback(() => {
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
        setIsEditing(false);
    }, []);

    const validateSinDetails = useCallback((clubDistances: any[], needsClub: boolean, needsPenalty: boolean, needsBogeysClub: boolean, needsDoubleChipReason: boolean) => {
        let blocked = false;

        if (needsClub && clubDistances.length > 0 && !selectedOffTeeClub) {
            setSinDetailsClubError(true);
            blocked = true;
        } else {
            setSinDetailsClubError(false);
        }

        if (needsPenalty && !selectedPenaltyType) {
            setSinDetailsPenaltyError(true);
            blocked = true;
        } else {
            setSinDetailsPenaltyError(false);
        }

        if (needsBogeysClub && clubDistances.length > 0 && !selectedBogeysClub) {
            setSinDetailsBogeysClubError(true);
            blocked = true;
        } else {
            setSinDetailsBogeysClubError(false);
        }

        if (needsDoubleChipReason && !selectedDoubleChipReason) {
            setSinDetailsDoubleChipReasonError(true);
            blocked = true;
        } else {
            setSinDetailsDoubleChipReasonError(false);
        }

        return !blocked;
    }, [selectedOffTeeClub, selectedPenaltyType, selectedBogeysClub, selectedDoubleChipReason]);

    return {
        isEditing,
        setIsEditing,
        editedScores,
        setEditedScores,
        selectedScore,
        setSelectedScore,
        showSaveConfirm,
        setShowSaveConfirm,
        showDeleteConfirm,
        setShowDeleteConfirm,
        editedSins,
        setEditedSins,
        sinsHoleNumber,
        setSinsHoleNumber,
        selectedOffTeeClub,
        setSelectedOffTeeClub,
        selectedPenaltyType,
        setSelectedPenaltyType,
        selectedBogeysClub,
        setSelectedBogeysClub,
        selectedDoubleChipReason,
        setSelectedDoubleChipReason,
        sinDetailsClubError,
        setSinDetailsClubError,
        sinDetailsPenaltyError,
        setSinDetailsPenaltyError,
        sinDetailsBogeysClubError,
        setSinDetailsBogeysClubError,
        sinDetailsDoubleChipReasonError,
        setSinDetailsDoubleChipReasonError,
        hadPriorSinDetails,
        setHadPriorSinDetails,
        puttingStats,
        setPuttingStats,
        hadPriorPuttingStats,
        setHadPriorPuttingStats,
        resetEditState,
        resetScorecardAfterSave,
        validateSinDetails,
    };
}
