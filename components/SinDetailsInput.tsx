import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { ClubDistance, DeadlySinsValues } from '@/service/DbService';
import ClubPicker from './ClubPicker';
import PenaltyTypePicker from './PenaltyTypePicker';
import DoubleChipReasonPicker from './DoubleChipReasonPicker';

type Props = {
    sins: DeadlySinsValues;
    clubs: ClubDistance[];
    selectedOffTeeClub?: string;
    onOffTeeClubChange: (club: string) => void;
    showOffTeeClubError?: boolean;
    selectedPenaltyType?: string;
    onPenaltyTypeChange: (type: string) => void;
    showPenaltyTypeError?: boolean;
    selectedBogeysClub?: string;
    onBogeysClubChange: (club: string) => void;
    showBogeysClubError?: boolean;
    selectedDoubleChipReason?: string;
    onDoubleChipReasonChange: (reason: string) => void;
    showDoubleChipReasonError?: boolean;
};

const SinDetailsInput = ({
    sins,
    clubs,
    selectedOffTeeClub,
    onOffTeeClubChange,
    showOffTeeClubError = false,
    selectedPenaltyType,
    onPenaltyTypeChange,
    showPenaltyTypeError = false,
    selectedBogeysClub,
    onBogeysClubChange,
    showBogeysClubError = false,
    selectedDoubleChipReason,
    onDoubleChipReasonChange,
    showDoubleChipReasonError = false,
}: Props) => {
    const styles = useStyles();

    const shortestFirstClubs = [...clubs].sort((a, b) => a.CarryDistance - b.CarryDistance);

    return (
        <View style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
            {sins.troubleOffTee && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>Club used off the tee</Text>
                    <ClubPicker
                        clubs={clubs}
                        selectedClub={selectedOffTeeClub}
                        onSelectClub={onOffTeeClubChange}
                        showError={showOffTeeClubError}
                    />
                </View>
            )}
            {sins.penalties && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>Penalty type</Text>
                    <PenaltyTypePicker
                        selectedPenaltyType={selectedPenaltyType}
                        onSelectPenaltyType={onPenaltyTypeChange}
                        showError={showPenaltyTypeError}
                    />
                </View>
            )}
            {sins.bogeysInside9Iron && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>Approach club</Text>
                    <ClubPicker
                        clubs={shortestFirstClubs}
                        selectedClub={selectedBogeysClub}
                        onSelectClub={onBogeysClubChange}
                        showError={showBogeysClubError}
                        testIDPrefix="bogeys-club-picker"
                    />
                </View>
            )}
            {sins.doubleChips && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>Double chip reason</Text>
                    <DoubleChipReasonPicker
                        selectedReason={selectedDoubleChipReason}
                        onSelectReason={onDoubleChipReasonChange}
                        showError={showDoubleChipReasonError}
                    />
                </View>
            )}
        </View>
    );
};

export default SinDetailsInput;
