import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    randomNumber: number;
}

// Card showing the latest random number, or a dash before the first one
export default function RandomNumberDisplay({ randomNumber }: Props) {
    const styles = useStyles();
    const s = styles.randomPage;

    return (
        <View testID="random-number-card" style={s.numberCard}>
            <Text testID="random-number-value" style={s.numberText}>
                {randomNumber > 0 ? String(randomNumber) : '–'}
            </Text>
            <Text style={s.numberCaption}>Tap Generate, or turn on the mic and say “next”, to produce a number</Text>
        </View>
    );
}
