import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';

type ToggleOption = {
    label: string;
    value: string | number;
};

type SettingsToggleRowProps = {
    options: ToggleOption[];
    value: string | number;
    onChange: (value: string | number) => void;
    testIDPrefix?: string;
};

export default function SettingsToggleRow({
    options,
    value,
    onChange,
    testIDPrefix = '',
}: SettingsToggleRowProps) {
    const colours = useThemeColours();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
        },
        button: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            marginHorizontal: 0,
            borderRadius: 8,
            backgroundColor: colours.background,
            borderWidth: 1,
            borderColor: colours.primary,
        },
        selectedButton: {
            backgroundColor: colours.primary,
        },
        unselectedText: {
            color: colours.primary,
            fontSize: 14,
            fontWeight: '500',
        },
        selectedText: {
            color: colours.background,
            fontSize: 14,
            fontWeight: '500',
        },
    });

    return (
        <View style={styles.container}>
            {options.map(({ label, value: optionValue }) => {
                const isSelected = value === optionValue;
                const testID = testIDPrefix ? `${testIDPrefix}-${optionValue}` : String(optionValue);
                return (
                    <TouchableOpacity
                        key={String(optionValue)}
                        testID={testID}
                        onPress={() => onChange(optionValue)}
                        style={[styles.button, isSelected && styles.selectedButton]}
                    >
                        <Text
                            testID={isSelected ? `${testID}-selected` : undefined}
                            style={isSelected ? styles.selectedText : styles.unselectedText}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
