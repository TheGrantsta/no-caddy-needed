import { Text, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { ClubDistance } from '@/service/DbService';
import fontSizes from '@/assets/font-sizes';
import Dropdown from './Dropdown';

type Props = {
    clubs: ClubDistance[];
    selectedClub?: string;
    onSelectClub: (club: string) => void;
    showError?: boolean;
    errorText?: string;
    emptyStateText?: string;
    testIDPrefix?: string;
};

const ClubPicker = ({
    clubs,
    selectedClub,
    onSelectClub,
    showError = false,
    errorText = 'Required',
    emptyStateText = 'Add clubs in Distances to log which club you used',
    testIDPrefix = 'club-picker',
}: Props) => {
    const colours = useThemeColours();

    if (clubs.length === 0) {
        return (
            <View style={{ marginBottom: 12 }}>
                <Text testID={`${testIDPrefix}-empty-state`} style={{ color: colours.primary, fontSize: fontSizes.smallText }}>
                    {emptyStateText}
                </Text>
            </View>
        );
    }

    return (
        <Dropdown
            options={clubs.map(c => c.Club)}
            selectedOption={selectedClub}
            onSelectOption={onSelectClub}
            placeholder="Select a club"
            showError={showError && clubs.length > 0}
            errorText={errorText}
            testIDPrefix={testIDPrefix}
        />
    );
};

export default ClubPicker;
