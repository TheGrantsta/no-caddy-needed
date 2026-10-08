import React from 'react';
import { View } from 'react-native';
import DeadlySinsTally from './DeadlySinsTally';
import SinDetailsInput from './SinDetailsInput';
import PuttingStatsInput from './PuttingStatsInput';
import { DeadlySinsValues, ClubDistance, RoundHoleScore } from '../service/DbService';

interface Props {
    selectedHoleNumber: number;
    holePar: number;
    editedSins: DeadlySinsValues;
    onSinsChange: (sins: DeadlySinsValues) => void;
    clubDistances: ClubDistance[];
    selectedOffTeeClub?: string;
    onOffTeeClubChange: (club: string | undefined) => void;
    showOffTeeClubError: boolean;
    selectedPenaltyType?: string;
    onPenaltyTypeChange: (penalty: string | undefined) => void;
    showPenaltyTypeError: boolean;
    selectedBogeysClub?: string;
    onBogeysClubChange: (club: string | undefined) => void;
    showBogeysClubError: boolean;
    selectedDoubleChipReason?: string;
    onDoubleChipReasonChange: (reason: string | undefined) => void;
    showDoubleChipReasonError: boolean;
    puttingStats: { firstPutt?: number; secondPutt?: number; secondIsLong: boolean } | null;
    onPuttingStatsChange: (firstPutt?: number, secondPutt?: number, secondIsLong?: boolean) => void;
    initialFirstPutt?: number;
    initialSecondPutt?: number;
    initialSecondIsLong: boolean;
    editedScores: RoundHoleScore[];
    playerId?: number;
}

export default function SinEditPanel({
    selectedHoleNumber,
    holePar,
    editedSins,
    onSinsChange,
    clubDistances,
    selectedOffTeeClub,
    onOffTeeClubChange,
    showOffTeeClubError,
    selectedPenaltyType,
    onPenaltyTypeChange,
    showPenaltyTypeError,
    selectedBogeysClub,
    onBogeysClubChange,
    showBogeysClubError,
    selectedDoubleChipReason,
    onDoubleChipReasonChange,
    showDoubleChipReasonError,
    _puttingStats,
    onPuttingStatsChange,
    initialFirstPutt,
    initialSecondPutt,
    initialSecondIsLong,
    editedScores,
    playerId,
}: Props) {
    const userScore = editedScores.find(s => s.HoleNumber === selectedHoleNumber && s.RoundPlayerId === playerId)?.Score;

    return (
        <View testID="sin-edit-panel">
            <DeadlySinsTally
                key={selectedHoleNumber}
                onEndRound={() => { }}
                roundControlled
                onValuesChange={onSinsChange}
                initialValues={editedSins}
                holePar={holePar}
                userScore={userScore}
            />

            {(editedSins.troubleOffTee || editedSins.penalties || editedSins.bogeysInside9Iron || editedSins.doubleChips) && (
                <SinDetailsInput
                    key={`sin-details-${selectedHoleNumber}`}
                    sins={editedSins}
                    clubs={clubDistances}
                    selectedOffTeeClub={selectedOffTeeClub}
                    onOffTeeClubChange={onOffTeeClubChange}
                    showOffTeeClubError={showOffTeeClubError}
                    selectedPenaltyType={selectedPenaltyType}
                    onPenaltyTypeChange={onPenaltyTypeChange}
                    showPenaltyTypeError={showPenaltyTypeError}
                    selectedBogeysClub={selectedBogeysClub}
                    onBogeysClubChange={onBogeysClubChange}
                    showBogeysClubError={showBogeysClubError}
                    selectedDoubleChipReason={selectedDoubleChipReason}
                    onDoubleChipReasonChange={onDoubleChipReasonChange}
                    showDoubleChipReasonError={showDoubleChipReasonError}
                />
            )}

            <PuttingStatsInput
                key={`putting-stats-${selectedHoleNumber}`}
                holePar={holePar}
                threePuttSelected={editedSins.threePutts ?? false}
                onStatsChange={(firstPutt, secondPutt, secondIsLong) => {
                    onPuttingStatsChange(firstPutt, secondPutt, secondIsLong);
                }}
                initialFirstPutt={initialFirstPutt}
                initialSecondPutt={initialSecondPutt}
                initialSecondIsLong={initialSecondIsLong}
            />
        </View>
    );
}
