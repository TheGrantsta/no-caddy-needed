import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    testID: string;
    value: string;
    maxDistance: number;
    onChange: (value: string) => void;
    hasError?: boolean;
    // When true, offers a "No putt - chip in" option (stored as '0') above 1 ft
    allowChipIn?: boolean;
};

export const CHIP_IN_VALUE = '0';
const CHIP_IN_LABEL = 'No putt';

// Choose a putt distance (in feet) from a list shown inline under the box instead of typing it.
// To go back to a modal sheet, restore the Modal wrapper that this replaced.
const PuttDistancePicker = ({ testID, value, maxDistance, onChange, hasError = false, allowChipIn = false }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.puttPicker;
    const [open, setOpen] = useState(false);
    const textColour = hasError ? colours.red : colours.black;

    const choose = (next: string) => {
        onChange(next);
        setOpen(false);
    };

    // Distances start at 1 ft: 0 ft is not offered in the list
    const distances = Array.from({ length: maxDistance }, (_, i) => i + 1);

    const boxLabel = allowChipIn && value === CHIP_IN_VALUE ? CHIP_IN_LABEL : value || '0';

    return (
        <View style={s.column}>
            <TouchableOpacity
                testID={testID}
                accessibilityRole="button"
                onPress={() => setOpen(true)}
                style={[s.box, hasError && s.boxError]}
            >
                <Text style={[s.boxText, { color: textColour }]}>{boxLabel}</Text>
            </TouchableOpacity>

            {open && (
                <View style={s.inlineList}>
                    <ScrollView nestedScrollEnabled>
                        <TouchableOpacity testID={`${testID}-option-clear`} onPress={() => choose('')} style={s.option}>
                            <Text style={s.clearText}>Clear</Text>
                        </TouchableOpacity>
                        {allowChipIn && (
                            <TouchableOpacity
                                testID={`${testID}-option-chip-in`}
                                onPress={() => choose(CHIP_IN_VALUE)}
                                style={[s.option, value === CHIP_IN_VALUE && s.optionSelected]}
                            >
                                <Text numberOfLines={1} style={[s.optionText, s.chipInText]}>{CHIP_IN_LABEL}</Text>
                            </TouchableOpacity>
                        )}
                        {distances.map(n => (
                            <TouchableOpacity
                                key={n}
                                testID={`${testID}-option-${n}`}
                                onPress={() => choose(String(n))}
                                style={[s.option, String(n) === value && s.optionSelected]}
                            >
                                <Text style={s.optionText}>{`${n} ft`}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default PuttDistancePicker;
