import React from 'react';
import { Text, View } from 'react-native';
import SinDetailsInput from './SinDetailsInput';
import { useStyles } from '../hooks/useStyles';
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
    const styles = useStyles();

    return (
        <View>
            <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text style={styles.normalText}>Hole {holeNumber} — Sin Details</Text>
            </View>
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
