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
                sins={deadlySinsValues}
                clubs={clubDistances}
                selectedOffTeeClub={selectedOffTeeClub}
                onOffTeeClubChange={onOffTeeClubChange}
                showOffTeeClubError={sinDetailsClubError}
                selectedPenaltyType={selectedPenaltyType}
                onPenaltyTypeChange={onPenaltyTypeChange}
                showPenaltyTypeError={sinDetailsPenaltyError}
                selectedBogeysClub={selectedBogeysClub}
                onBogeysClubChange={onBogeysClubChange}
                showBogeysClubError={sinDetailsBogeysClubError}
                selectedDoubleChipReason={selectedDoubleChipReason}
                onDoubleChipReasonChange={onDoubleChipReasonChange}
                showDoubleChipReasonError={sinDetailsDoubleChipReasonError}
            />
        </View>
    );
}
