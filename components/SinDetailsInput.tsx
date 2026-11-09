import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { ClubDistance, DeadlySinsValues } from '@/service/DbService';
import ClubPicker from './ClubPicker';
import PenaltyTypePicker from './PenaltyTypePicker';
import DoubleChipReasonPicker from './DoubleChipReasonPicker';

type FollowUpSin = 'troubleOffTee' | 'penalties' | 'bogeysInside9Iron' | 'doubleChips';

type Props = {
    sins: DeadlySinsValues;
    // When set, only that sin's follow-up is rendered (used under its row in the deadly sins card)
    only?: FollowUpSin;
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
    only,
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
    const shows = (sin: FollowUpSin) => sins[sin] && (only === undefined || only === sin);

    return (
        <View style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
            {shows('troubleOffTee') && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>Club off the tee</Text>
                    <ClubPicker
                        clubs={clubs}
                        selectedClub={selectedOffTeeClub}
                        onSelectClub={onOffTeeClubChange}
                        showError={showOffTeeClubError}
                    />
                </View>
            )}
            {shows('penalties') && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>Penalty type</Text>
                    <PenaltyTypePicker
                        selectedPenaltyType={selectedPenaltyType}
                        onSelectPenaltyType={onPenaltyTypeChange}
                        showError={showPenaltyTypeError}
                    />
                </View>
            )}
            {shows('bogeysInside9Iron') && (
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
            {shows('doubleChips') && (
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
