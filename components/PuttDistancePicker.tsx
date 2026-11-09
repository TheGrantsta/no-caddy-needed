import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    testID: string;
    value: string;
    maxDistance: number;
    onChange: (value: string) => void;
    hasError?: boolean;
};

// Choose a putt distance (in feet) from a list instead of typing it
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

    const distances = Array.from({ length: maxDistance + 1 }, (_, n) => n);

    return (
        <>
            <TouchableOpacity
                testID={testID}
                accessibilityRole="button"
                onPress={() => setOpen(true)}
                style={[s.box, hasError && s.boxError]}
            >
                <Text style={[s.boxText, { color: textColour }]}>{value || '0'}</Text>
            </TouchableOpacity>

            <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)} style={s.backdrop} />
                <View style={s.sheet}>
                    <ScrollView>
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
            </Modal>
        </>
    );
};

export default PuttDistancePicker;
