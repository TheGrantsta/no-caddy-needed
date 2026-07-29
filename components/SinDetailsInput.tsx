import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { ClubDistance, DeadlySinsValues } from '@/service/DbService';
import ClubPicker from './ClubPicker';

type Props = {
    sins: DeadlySinsValues;
    clubs: ClubDistance[];
    selectedOffTeeClub?: string;
    onOffTeeClubChange: (club: string) => void;
    showOffTeeClubError?: boolean;
};

const SinDetailsInput = ({
    sins,
    clubs,
    selectedOffTeeClub,
    onOffTeeClubChange,
    showOffTeeClubError = false,
}: Props) => {
    const styles = useStyles();

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
            {/* future: penalties section */}
            {/* future: bogeysInside9Iron club section */}
        </View>
    );
};

export default SinDetailsInput;
