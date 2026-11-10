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
};

// Choose a putt distance (in feet) from a list shown inline under the box instead of typing it.
// To go back to a modal sheet, restore the Modal wrapper that this replaced.
const PuttDistancePicker = ({ testID, value, maxDistance, onChange, hasError = false }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.puttPicker;
    const [open, setOpen] = useState(false);
    const textColour = hasError ? colours.red : colours.text;

    const choose = (next: string) => {
        onChange(next);
        setOpen(false);
    };

    // Distances start at 1 ft: 0 ft is not offered in the list
    const distances = Array.from({ length: maxDistance }, (_, i) => i + 1);

    return (
        <View style={s.column}>
            <TouchableOpacity
                testID={testID}
                accessibilityRole="button"
                onPress={() => setOpen(true)}
                style={[s.box, hasError && s.boxError]}
            >
                <Text style={[s.boxText, { color: textColour }]}>{value || '0'}</Text>
            </TouchableOpacity>

            {open && (
                <View style={s.inlineList}>
                    <ScrollView nestedScrollEnabled>
                        <TouchableOpacity testID={`${testID}-option-clear`} onPress={() => choose('')} style={s.option}>
                            <Text style={s.clearText}>Clear</Text>
                        </TouchableOpacity>
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
