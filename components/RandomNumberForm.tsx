import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    rangeText: string;
    rangeError: string;
    onRangeChange: (text: string) => void;
    incrementText: string;
    incrementError: string;
    onIncrementChange: (text: string) => void;
}

export default function RandomNumberForm({
    rangeText,
    rangeError,
    onRangeChange,
    incrementText,
    incrementError,
    onIncrementChange,
}: Props) {
    const styles = useStyles();

    return (
        <View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.textLabel, { width: 120 }]}>
                    Range
                </Text>
                <TextInput
                    style={[styles.textInput, rangeError ? styles.textInputError : null, { width: 150 }]}
                    value={rangeText}
                    placeholder='Lower and upper limits'
                    onChangeText={onRangeChange}
                    keyboardType='numbers-and-punctuation'
                />
            </View>
            {rangeError ? <Text style={[styles.errorText, { marginLeft: 100 }]}>{rangeError}</Text> : null}

            <View>
                <Text style={styles.smallestText}>
                    Range: the lower and upper bound of numbers (inclusive) between which the random number will be generated
                </Text>
            </View>

            <View style={[{ flexDirection: 'row', marginTop: 10 }]}>
                <Text style={[styles.textLabel, { width: 120 }]}>
                    Increment
                </Text>
                <TextInput
                    style={[styles.textInput, incrementError ? styles.textInputError : null, { width: 100 }]}
                    value={incrementText}
                    placeholder='Increment'
                    onChangeText={onIncrementChange}
                    keyboardType='number-pad'
                />
            </View>
            {incrementError ? <Text style={[styles.errorText, { marginLeft: 100 }]}>{incrementError}</Text> : null}

            <View>
                <Text style={styles.smallestText}>
                    Increment: specifies the "step" between the random numbers; for example, an increment of 5 would mean the random number is divisible by 5
                </Text>
            </View>
        </View>
    );
}
