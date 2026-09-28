import { useState, useCallback } from 'react';
import { DeadlySinsValues } from '../service/DbService';

export type HolePhase = 'score' | 'stats' | 'sinDetails' | 'putting';

export interface PuttingStats {
    firstPutt?: number;
    secondPutt?: number;
    secondIsLong: boolean;
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

export function useHoleLifecycle() {
    const [currentHole, setCurrentHole] = useState(1);
    const [holePhase, setHolePhase] = useState<HolePhase>('score');
    const [skipStatsFlow, setSkipStatsFlow] = useState(false);
    const [deadlySinsValues, setDeadlySinsValues] = useState<DeadlySinsValues>(INITIAL_SINS);
    const [puttingStats, setPuttingStats] = useState<PuttingStats | null>(null);
    const [puttingFirstPuttError, setPuttingFirstPuttError] = useState(false);
    const [puttingSecondPuttError, setPuttingSecondPuttError] = useState(false);
    const [puttingSecondPuttRequiredError, setPuttingSecondPuttRequiredError] = useState(false);
    const [selectedOffTeeClub, setSelectedOffTeeClub] = useState<string | undefined>(undefined);
    const [sinDetailsClubError, setSinDetailsClubError] = useState(false);
    const [selectedPenaltyType, setSelectedPenaltyType] = useState<string | undefined>(undefined);
    const [sinDetailsPenaltyError, setSinDetailsPenaltyError] = useState(false);
    const [selectedBogeysClub, setSelectedBogeysClub] = useState<string | undefined>(undefined);
    const [sinDetailsBogeysClubError, setSinDetailsBogeysClubError] = useState(false);
    const [selectedDoubleChipReason, setSelectedDoubleChipReason] = useState<string | undefined>(undefined);
    const [sinDetailsDoubleChipReasonError, setSinDetailsDoubleChipReasonError] = useState(false);
    const [showBadHoleReassurance, setShowBadHoleReassurance] = useState(false);
    const [reassuranceMessage, setReassuranceMessage] = useState('');

    const setCurrentHoleValue = useCallback((hole: number) => {
        setCurrentHole(Math.max(1, Math.min(18, hole)));
    }, []);

    const advanceHole = useCallback(() => {
        setCurrentHole(prev => (prev < 18 ? prev + 1 : 18));
    }, []);

    const goBackHole = useCallback(() => {
        setCurrentHole(prev => (prev > 1 ? prev - 1 : 1));
    }, []);

    const resetForNewHole = useCallback(() => {
        setHolePhase('score');
        setDeadlySinsValues(INITIAL_SINS);
        setPuttingStats(null);
        setPuttingFirstPuttError(false);
        setPuttingSecondPuttError(false);
        setPuttingSecondPuttRequiredError(false);
        setSelectedOffTeeClub(undefined);
        setSinDetailsClubError(false);
        setSelectedPenaltyType(undefined);
        setSinDetailsPenaltyError(false);
        setSelectedBogeysClub(undefined);
        setSinDetailsBogeysClubError(false);
        setSelectedDoubleChipReason(undefined);
        setSinDetailsDoubleChipReasonError(false);
        setShowBadHoleReassurance(false);
    }, []);

    const validatePuttingStats = useCallback((stats: PuttingStats | null) => {
        let hasError = false;

        if (!stats || stats.firstPutt === undefined) {
            setPuttingFirstPuttError(true);
            hasError = true;
        } else {
            setPuttingFirstPuttError(false);
        }

        if (deadlySinsValues.threePutts && (!stats || stats.secondPutt === undefined)) {
            setPuttingSecondPuttRequiredError(true);
            hasError = true;
        } else {
            setPuttingSecondPuttRequiredError(false);
        }

        return !hasError;
    }, [deadlySinsValues.threePutts]);

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

    const resetAll = useCallback(() => {
        setCurrentHole(1);
        setHolePhase('score');
        setSkipStatsFlow(false);
        setDeadlySinsValues(INITIAL_SINS);
        setPuttingStats(null);
        setPuttingFirstPuttError(false);
        setPuttingSecondPuttError(false);
        setPuttingSecondPuttRequiredError(false);
        setSelectedOffTeeClub(undefined);
        setSinDetailsClubError(false);
        setSelectedPenaltyType(undefined);
        setSinDetailsPenaltyError(false);
        setSelectedBogeysClub(undefined);
        setSinDetailsBogeysClubError(false);
        setSelectedDoubleChipReason(undefined);
        setSinDetailsDoubleChipReasonError(false);
        setShowBadHoleReassurance(false);
        setReassuranceMessage('');
    }, []);

    return {
        currentHole,
        setCurrentHoleValue,
        holePhase,
        setHolePhase,
        skipStatsFlow,
        setSkipStatsFlow,
        deadlySinsValues,
        setDeadlySinsValues,
        puttingStats,
        setPuttingStats,
        puttingFirstPuttError,
        puttingSecondPuttError,
        puttingSecondPuttRequiredError,
        selectedOffTeeClub,
        setSelectedOffTeeClub,
        sinDetailsClubError,
        selectedPenaltyType,
        setSelectedPenaltyType,
        sinDetailsPenaltyError,
        selectedBogeysClub,
        setSelectedBogeysClub,
        sinDetailsBogeysClubError,
        selectedDoubleChipReason,
        setSelectedDoubleChipReason,
        sinDetailsDoubleChipReasonError,
        showBadHoleReassurance,
        setShowBadHoleReassurance,
        reassuranceMessage,
        setReassuranceMessage,
        advanceHole,
        goBackHole,
        resetForNewHole,
        validatePuttingStats,
        validateSinDetails,
        resetAll,
    };
}
