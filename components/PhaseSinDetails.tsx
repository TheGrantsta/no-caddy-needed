import React from 'react';
import { View } from 'react-native';
import SinDetailsInput from './SinDetailsInput';
import { DeadlySinsValues, ClubDistance } from '../service/DbService';

interface Props {
    holeNumber: number;
    clubDistances: ClubDistance[];
    deadlySinsValues: DeadlySinsValues;
    selectedOffTeeClub?: string;
    sinDetailsClubError: boolean;
    selectedPenaltyType?: string;
    sinDetailsPenaltyError: boolean;
    selectedBogeysClub?: string;
    sinDetailsBogeysClubError: boolean;
    selectedDoubleChipReason?: string;
    sinDetailsDoubleChipReasonError: boolean;
    onOffTeeClubChange: (club?: string) => void;
    onPenaltyTypeChange: (type?: string) => void;
    onBogeysClubChange: (club?: string) => void;
    onDoubleChipReasonChange: (reason?: string) => void;
}

export default function PhaseSinDetails({
    holeNumber,
    clubDistances,
    deadlySinsValues,
    selectedOffTeeClub,
    sinDetailsClubError,
    selectedPenaltyType,
    sinDetailsPenaltyError,
    selectedBogeysClub,
    sinDetailsBogeysClubError,
    selectedDoubleChipReason,
    sinDetailsDoubleChipReasonError,
    onOffTeeClubChange,
    onPenaltyTypeChange,
    onBogeysClubChange,
    onDoubleChipReasonChange,
}: Props) {
    return (
        <View>
            <SinDetailsInput
                holeNumber={holeNumber}
                clubDistances={clubDistances}
                deadlySinsValues={deadlySinsValues}
                selectedOffTeeClub={selectedOffTeeClub}
                sinDetailsClubError={sinDetailsClubError}
                selectedPenaltyType={selectedPenaltyType}
                sinDetailsPenaltyError={sinDetailsPenaltyError}
                selectedBogeysClub={selectedBogeysClub}
                sinDetailsBogeysClubError={sinDetailsBogeysClubError}
                selectedDoubleChipReason={selectedDoubleChipReason}
                sinDetailsDoubleChipReasonError={sinDetailsDoubleChipReasonError}
                onOffTeeClubChange={onOffTeeClubChange}
                onPenaltyTypeChange={onPenaltyTypeChange}
                onBogeysClubChange={onBogeysClubChange}
                onDoubleChipReasonChange={onDoubleChipReasonChange}
            />
        </View>
    );
}
