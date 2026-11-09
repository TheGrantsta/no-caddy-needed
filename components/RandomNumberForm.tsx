import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    fromText: string;
    fromError: string;
    onFromChange: (text: string) => void;
    toText: string;
    toError: string;
    onToChange: (text: string) => void;
    incrementText: string;
    incrementError: string;
    onIncrementChange: (text: string) => void;
    // Plain-English summary of the numbers the settings produce, or null when they are incomplete
    caption: string | null;
}

// Settings card with From, To and Increment values, then a summary of what they produce
export default function RandomNumberForm({
    fromText,
    fromError,
    onFromChange,
    toText,
    toError,
    onToChange,
    incrementText,
    incrementError,
    onIncrementChange,
    caption,
}: Props) {
    const styles = useStyles();
    const s = styles.randomPage;

    const rows = [
        { label: 'From', value: fromText, error: fromError, onChange: onFromChange },
        { label: 'To', value: toText, error: toError, onChange: onToChange },
        { label: 'Increment', value: incrementText, error: incrementError, onChange: onIncrementChange },
    ];

    return (
        <View>
            <Text style={s.sectionLabel}>SETTINGS</Text>
            <View style={s.settingsCard}>
                {rows.map((row, index) => (
                    <View key={row.label}>
                        {index > 0 && <View style={s.rowDivider} />}
                        <View style={s.settingsRow}>
                            <Text style={s.settingsLabel}>{row.label}</Text>
                            <TextInput
                                style={[s.valueBox, row.error ? s.valueBoxError : null]}
                                value={row.value}
                                onChangeText={row.onChange}
                                keyboardType="number-pad"
                            />
                        </View>
                        {row.error ? <Text style={s.rowError}>{row.error}</Text> : null}
                    </View>
                ))}
            </View>
            {caption ? <Text style={s.caption}>{caption}</Text> : null}
        </View>
    );
}
