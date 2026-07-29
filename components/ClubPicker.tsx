import { Text, TouchableOpacity, View, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { ClubDistance } from '@/service/DbService';
import fontSizes from '@/assets/font-sizes';

type Props = {
    clubs: ClubDistance[];
    selectedClub?: string;
    onSelectClub: (club: string) => void;
    showError?: boolean;
    errorText?: string;
    emptyStateText?: string;
};

const ClubPicker = ({
    clubs,
    selectedClub,
    onSelectClub,
    showError = false,
    errorText = 'Required',
    emptyStateText = 'Add clubs in Distances to log which club you used',
}: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const [showDropdown, setShowDropdown] = useState(false);

    if (clubs.length === 0) {
        return (
            <View style={{ marginBottom: 12 }}>
                <Text testID="club-picker-empty-state" style={{ color: colours.primary, fontSize: fontSizes.smallText }}>
                    {emptyStateText}
                </Text>
            </View>
        );
    }

    const handleSelectClub = (club: string) => {
        onSelectClub(club);
        setShowDropdown(false);
    };

    return (
        <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
                testID="club-picker-dropdown-toggle"
                onPress={() => setShowDropdown(true)}
                style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colours.primary,
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        color: selectedClub ? colours.primary : colours.primary,
                        fontSize: fontSizes.smallText,
                        fontWeight: '500',
                    }}
                >
                    {selectedClub || 'Select a club'}
                </Text>
                <MaterialIcons name="expand-more" size={20} color={colours.primary} />
            </TouchableOpacity>

            <Modal
                testID="club-picker-modal"
                visible={showDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onPress={() => setShowDropdown(false)}
                    activeOpacity={1}
                >
                    <View
                        style={{
                            backgroundColor: colours.background,
                            borderRadius: 8,
                            marginHorizontal: 16,
                            marginTop: 100,
                            maxHeight: 300,
                        }}
                        onStartShouldSetResponder={() => true}
                    >
                        <FlatList
                            data={clubs}
                            keyExtractor={club => club.Id.toString()}
                            scrollEnabled={clubs.length > 6}
                            renderItem={({ item: club }) => (
                                <TouchableOpacity
                                    testID={`club-picker-option-${club.Club}`}
                                    onPress={() => handleSelectClub(club.Club)}
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colours.divider || '#333',
                                        backgroundColor: selectedClub === club.Club ? colours.primary : 'transparent',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: selectedClub === club.Club ? colours.background : colours.primary,
                                            fontSize: fontSizes.smallText,
                                            fontWeight: selectedClub === club.Club ? '600' : '500',
                                        }}
                                    >
                                        {club.Club}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {showError && clubs.length > 0 && (
                <Text testID="club-picker-error" style={{ color: colours.errorText, fontSize: fontSizes.smallText, marginTop: 4 }}>
                    {errorText}
                </Text>
            )}
        </View>
    );
};

export default ClubPicker;
