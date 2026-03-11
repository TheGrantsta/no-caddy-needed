import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, TextInput, RefreshControl, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getRandomNumber } from '../../assets/random-number';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { MaterialIcons } from '@expo/vector-icons';
import { getSettingsService } from '../../service/DbService';
import Chevrons from '@/components/Chevrons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';

const FEMALE_VOICE_NAMES = ['samantha', 'ava', 'allison', 'susan', 'noelle', 'karen', 'moira', 'tessa', 'fiona'];
const MALE_VOICE_NAMES = ['tom', 'alex', 'fred', 'daniel', 'lee', 'ralph', 'rishi'];

const getVoiceOptions = async (voice: string): Promise<Record<string, unknown>> => {
    if (voice === 'neutral') return {};

    const names = voice === 'female' ? FEMALE_VOICE_NAMES : MALE_VOICE_NAMES;
    const fallbackPitch = voice === 'female' ? 1.5 : 0.5;

    try {
        const available = await Speech.getAvailableVoicesAsync();
        const match = available.find(v =>
            v.language.startsWith('en') && names.some(n => v.name.toLowerCase().includes(n))
        );
        if (match) return { voice: match.identifier };
    } catch { }

    return { pitch: fallbackPitch };
};

export default function Random() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const [refreshing, setRefreshing] = useState(false);
    const [rangeText, setRangeText] = useState('30-100');
    const [rangeError, setRangeError] = useState('');
    const [incrementText, setIncrementText] = useState('10');
    const [incrementError, setIncrementError] = useState('');
    const [randomNumber, setRandomNumber] = useState(0);
    const [micActive, setMicActive] = useState(false);
    const isStoppingRef = useRef(false);

    useSpeechRecognitionEvent('result', (event) => {
        if (isStoppingRef.current) return;
        const transcript = (event.results[0]?.transcript ?? '').toLowerCase();
        const lastWord = transcript.trim().split(" ").pop();

        console.debug('Heard:', transcript, 'Last word:', lastWord);

        if (lastWord === 'next') {
            handleGenerate();
        }
    });

    useEffect(() => {
        return () => {
            ExpoSpeechRecognitionModule.stop();
        };
    }, []);

    const handleMicToggle = async () => {
        if (!micActive) {
            isStoppingRef.current = false;
            const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (granted) {
                ExpoSpeechRecognitionModule.start({ lang: 'en-GB', continuous: true, interimResults: true });
                setMicActive(true);
            }
        } else {
            isStoppingRef.current = true;
            ExpoSpeechRecognitionModule.stop();
            setMicActive(false);
        }
    };

    const handleGenerate = async () => {
        if (rangeText.length < 1) {
            setRangeError('Range cannot be empty');
        }
        if (incrementText.length < 1) {
            setIncrementError('Increment cannot be empty');
        }
        if (rangeText.length > 0 && incrementText.length > 0) {
            const number = getRandomNumber(rangeText, incrementText, randomNumber);
            setRandomNumber(number);
            const settings = getSettingsService();
            if (number > 0 && settings.soundsEnabled) {
                const options = await getVoiceOptions(settings.voice);
                Speech.speak(String(number), options);
            }
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
            setRangeText('30-100');
            setIncrementText('10');
            setRangeError('');
            setIncrementError('');
            setRandomNumber(0);
            setRefreshing(false);
        }, 750);
    };

    const points = ['Random: mimic play when practising', 'Focus: use your pre-shot routine', 'Evaluate: use your post-shot routine'];

    const localStyles = styles.randomTool;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>
                        Release to update
                    </Text>
                </View>
            )}

            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colours.primary} />
            }>
                <View>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.headerText, styles.marginTop]}>
                            Random number generator
                        </Text>
                    </View>
                    <View style={localStyles.container}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.textLabel, { width: 120 }]}>
                                Range
                            </Text>
                            <TextInput
                                style={[styles.textInput, rangeError ? styles.textInputError : null, { width: 150 }]}
                                value={rangeText}
                                placeholder='Lower and upper limits'
                                onChangeText={(value) => {
                                    handleRangeInput(value)
                                    if (rangeError) setRangeError('');
                                }}
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
                                onChangeText={(value) => {
                                    handleIncrementInput(value)
                                    if (incrementError) setIncrementError('');
                                }}
                                keyboardType='number-pad'
                            />
                        </View>
                        {incrementError ? <Text style={[styles.errorText, { marginLeft: 100 }]}>{incrementError}</Text> : null}

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

                        <View style={[styles.marginTop, styles.container]}>
                            <TouchableOpacity testID='save-button' style={localStyles.actionButton} onPress={handleGenerate}>
                                <Text style={localStyles.actionButtonText}>
                                    Generate
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                testID="mic-button"
                                style={[localStyles.micButton, micActive && localStyles.micButtonActive]}
                                onPress={handleMicToggle}
                            >
                                <Text style={[localStyles.actionButtonText, micActive ? { color: colours.background } : { color: colours.text }]}>
                                    Say "next"
                                </Text>
                                <MaterialIcons
                                    name={micActive ? 'mic' : 'mic-off'}
                                    size={28}
                                    color={micActive ? colours.background : colours.text}
                                />
                            </TouchableOpacity>

                            <Text style={styles.smallestText}>
                                Say "next" to generate a number hands-free (make sure to allow microphone permissions when prompted and have sounds enabled in Settings)
                            </Text>
                        </View>

                        <View style={styles.marginTop}>
                            <Chevrons heading='Purpose' points={points} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};