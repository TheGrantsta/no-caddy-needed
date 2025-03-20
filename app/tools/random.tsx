import { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getRandomNumber } from '../../assets/random-number';
import Chevrons from '@/components/Chevrons';
import styles from '@/assets/stlyes';
import colours from '@/assets/colours';
import fontSizes from '@/assets/font-sizes';

export default function Random() {
    const [refreshing, setRefreshing] = useState(false);
    const [rangeText, setRangeText] = useState('');
    const [rangeError, setRangeError] = useState('');
    const [incrementText, setIncrementText] = useState('');
    const [incrementError, setIncrementError] = useState('');
    const [randomNumber, setRandomNumber] = useState(0);

    const handleGenerate = () => {
        if (rangeText.length < 1) {
            setRangeError('Range cannot be empty');
        }
        if (incrementText.length < 1) {
            setIncrementError('Increment cannot be empty');
        }
        if (rangeText.length > 0 && incrementText.length > 0) {
            setRandomNumber(getRandomNumber(rangeText, incrementText, randomNumber));
        }
    };

    const handleRangeInput = (text: any) => {
        const formattedText = text.replace(/[^0-9-]/g, '');
        setRangeText(formattedText);
    }

    const handleIncrementInput = (text: any) => {
        const formattedText = text.replace(/[^0-9]/g, '');
        setIncrementText(formattedText);
    }

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRangeError('');
            setIncrementError('');
            setRandomNumber(0);
            setRefreshing(false);
        }, 750);
    };

    const points = ['Randomise practice to mimic play', 'Use your pre-shot routine', 'Use your post-shot routine'];

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>
                        Release to update
                    </Text>
                </View>
            )}

            <ScrollView style={styles.scrollContainer} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colours.yellow} />
            }>
                <View>
                    <Text style={styles.subHeaderText}>
                        Random number generator
                    </Text>
                    <Text style={styles.textLabel}>
                        Range
                    </Text>
                    <TextInput
                        style={[styles.textInput, rangeError ? styles.textInputError : null]}
                        value={rangeText}
                        placeholder='Lower and upper limits'
                        onChangeText={(value) => {
                            handleRangeInput(value)
                            if (rangeError) setRangeError('');
                        }}
                        keyboardType='numbers-and-punctuation'
                    />
                    {rangeError ? <Text style={styles.errorText}>{rangeError}</Text> : null}

                    <View>
                        <Text style={styles.smallestText}>
                            Range: the lower and upper bound of numbers (inclusive) between which the random number will be generated
                        </Text>
                    </View>

                    <Text style={styles.textLabel}>
                        Increment
                    </Text>
                    <TextInput
                        style={[styles.textInput, incrementError ? styles.textInputError : null]}
                        value={incrementText}
                        placeholder='Increment'
                        onChangeText={(value) => {
                            handleIncrementInput(value)
                            if (incrementError) setIncrementError('');
                        }}
                        keyboardType='number-pad'
                    />
                    {incrementError ? <Text style={styles.errorText}>{incrementError}</Text> : null}
                </View>

                <View>
                    <Text style={styles.smallestText}>
                        Increment: specifies the "step" between the random numbers; for example, an increment of 5 would mean the random number is divisible by 5
                    </Text>
                </View>

                {randomNumber > 0 && (
                    <View style={localStyles.randomNumberContainer}>
                        <Text style={localStyles.randomNumberText}>
                            {randomNumber}
                        </Text>
                    </View>
                )}

                <View style={styles.marginTop}>
                    <TouchableOpacity testID='save-button' style={styles.button} onPress={handleGenerate}>
                        <Text style={styles.buttonText}>
                            Run
                        </Text>
                    </TouchableOpacity>
                </View>
                <Chevrons heading='Purpose' points={points} />
            </ScrollView>
        </GestureHandlerRootView>
    );
};

const localStyles = StyleSheet.create({
    randomNumberContainer: {
        backgroundColor: colours.backgroundAlternate,
        borderColor: colours.white,
        borderWidth: 1,
        borderRadius: 12,
        marginTop: 15,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    randomNumberText: {
        color: colours.yellow,
        fontSize: fontSizes.massive,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial',
    },
});