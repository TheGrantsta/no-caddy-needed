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
};

export default function SettingsToggleRow({
    options,
    value,
    onChange,
}: SettingsToggleRowProps) {
    const colours = useThemeColours();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 10,
        },
        button: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginHorizontal: 4,
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
                return (
                    <TouchableOpacity
                        key={String(optionValue)}
                        onPress={() => onChange(optionValue)}
                        style={[styles.button, isSelected && styles.selectedButton]}
                    >
                        <Text style={isSelected ? styles.selectedText : styles.unselectedText}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
