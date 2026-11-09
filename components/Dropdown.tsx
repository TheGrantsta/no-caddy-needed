import { Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

type Props = {
    options: string[];
    selectedOption?: string;
    onSelectOption: (option: string) => void;
    placeholder?: string;
    showError?: boolean;
    errorText?: string;
    testIDPrefix: string;
    // Compact value-and-chevron toggle with no border, for use inside a list row
    inline?: boolean;
};

const Dropdown = ({
    options,
    selectedOption,
    onSelectOption,
    placeholder = 'Select an option',
    showError = false,
    errorText = 'Required',
    testIDPrefix,
    inline = false,
}: Props) => {
    const colours = useThemeColours();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSelectOption = (option: string) => {
        onSelectOption(option);
        setShowDropdown(false);
    };

    return (
        <View style={{ marginBottom: inline ? 0 : 12 }}>
            <TouchableOpacity
                testID={`${testIDPrefix}-dropdown-toggle`}
                onPress={() => setShowDropdown(true)}
                style={inline ? {
                    paddingVertical: 6,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    columnGap: 4,
                } : {
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: showError ? colours.red : colours.primary,
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        color: showError ? colours.red : colours.primary,
                        fontSize: fontSizes.smallText,
                        fontWeight: '500',
                    }}
                >
                    {selectedOption || placeholder}
                </Text>
                <MaterialIcons name="expand-more" size={20} color={showError ? colours.red : colours.primary} />
            </TouchableOpacity>

            <Modal
                testID={`${testIDPrefix}-modal`}
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
                        <ScrollView scrollEnabled={options.length > 6}>
                            {options.map(option => (
                                <TouchableOpacity
                                    key={option}
                                    testID={`${testIDPrefix}-option-${option}`}
                                    onPress={() => handleSelectOption(option)}
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colours.divider || '#333',
                                        backgroundColor: selectedOption === option ? colours.primary : 'transparent',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: selectedOption === option ? colours.background : colours.primary,
                                            fontSize: fontSizes.smallText,
                                            fontWeight: selectedOption === option ? '600' : '500',
                                        }}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {showError && (
                <Text testID={`${testIDPrefix}-error`} style={{ color: colours.errorText, fontSize: fontSizes.smallText, marginTop: 4 }}>
                    {errorText}
                </Text>
            )}
        </View>
    );
};

export default Dropdown;
