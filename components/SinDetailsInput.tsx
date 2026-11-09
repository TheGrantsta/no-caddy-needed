import { ReactNode } from 'react';
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

    // Single-sin follow-ups sit in one row (label on the left, value on the right); the full list stacks them
    const followUp = (sin: FollowUpSin, label: string, picker: ReactNode) => {
        if (only === undefined) {
            return (
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>{label}</Text>
                    {picker}
                </View>
            );
        }
        return (
            <View testID={`follow-up-row-${sin}`} style={styles.deadlySinsTally.followUpRow}>
                <Text style={styles.deadlySinsTally.followUpLabel}>{label}</Text>
                {picker}
            </View>
        );
    };

    return (
        <View style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
            {shows('troubleOffTee') && followUp('troubleOffTee', 'Club off the tee', (
                <ClubPicker
                    clubs={clubs}
                    selectedClub={selectedOffTeeClub}
                    onSelectClub={onOffTeeClubChange}
                    showError={showOffTeeClubError}
                    inline={only !== undefined}
                />
            ))}
            {shows('penalties') && followUp('penalties', 'Penalty type', (
                <PenaltyTypePicker
                    selectedPenaltyType={selectedPenaltyType}
                    onSelectPenaltyType={onPenaltyTypeChange}
                    showError={showPenaltyTypeError}
                    inline={only !== undefined}
                />
            ))}
            {shows('bogeysInside9Iron') && followUp('bogeysInside9Iron', 'Approach club', (
                <ClubPicker
                    clubs={shortestFirstClubs}
                    selectedClub={selectedBogeysClub}
                    onSelectClub={onBogeysClubChange}
                    showError={showBogeysClubError}
                    testIDPrefix="bogeys-club-picker"
                    inline={only !== undefined}
                />
            ))}
            {shows('doubleChips') && followUp('doubleChips', 'Double chip reason', (
                <DoubleChipReasonPicker
                    selectedReason={selectedDoubleChipReason}
                    onSelectReason={onDoubleChipReasonChange}
                    showError={showDoubleChipReasonError}
                    inline={only !== undefined}
                />
            ))}
        </View>
    );
};

export default SinDetailsInput;
