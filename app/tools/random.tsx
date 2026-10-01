import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getRandomNumber } from '../../assets/random-number';
import * as Speech from 'expo-speech';
import { getSettingsService } from '../../service/DbService';
import Chevrons from '@/components/Chevrons';
import RandomNumberForm from '@/components/RandomNumberForm';
import RandomNumberDisplay from '@/components/RandomNumberDisplay';
import RandomNumberActions from '@/components/RandomNumberActions';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { useFakeRefresh } from '@/hooks/useFakeRefresh';
import { useForm } from '../../hooks/useForm';
import { useToggle } from '../../hooks/useToggle';
import { validateRange, validateNumber } from '../../assets/validation';
interface SpeechRecognitionEvent {
    results: { transcript: string; isFinal: boolean }[];
}

let ExpoSpeechRecognitionModule: { requestPermissionsAsync: () => Promise<{ granted: boolean }>; start: (opts: object) => void; stop: () => void } | null = null;
let useSpeechRecognitionEvent: (eventName: string, handler: (event: SpeechRecognitionEvent) => void) => void = () => {};
let speechRecognitionAvailable = false;
try {
    const mod = require('expo-speech-recognition');
    ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
    speechRecognitionAvailable = true;
} catch { }

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
    const [formState, resetForm] = useForm({ range: '30-100', increment: '10' });
    const [randomNumber, setRandomNumber] = useState(0);
    const [micActive, , setMicActive] = useToggle(false);
    const isStoppingRef = useRef(false);

    const { refreshing, onRefresh } = useFakeRefresh(() => {
        resetForm();
        setRandomNumber(0);
    });

    useSpeechRecognitionEvent('result', (event: SpeechRecognitionEvent) => {
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
            ExpoSpeechRecognitionModule?.stop();
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
        const rangeError = validateRange(formState.range.value, 'Range');
        const incrementError = validateNumber(formState.increment.value, 'Increment');

        if (rangeError) {
            formState.range.setError(rangeError);
        }
        if (incrementError) {
            formState.increment.setError(incrementError);
        }

        if (!rangeError && !incrementError) {
            const number = getRandomNumber(formState.range.value, formState.increment.value, randomNumber);
            setRandomNumber(number);
            const settings = getSettingsService();
            if (number > 0 && settings.soundsEnabled) {
                Speech.stop();
                const options = await getVoiceOptions(settings.voice);
                Speech.speak(String(number), options);
            }
        }
    };

    const handleRangeInput = (text: string) => {
        const formattedText = text.replace(/[^0-9-]/g, '');
        formState.range.onChange(formattedText);
    }

    const handleIncrementInput = (text: string) => {
        const formattedText = text.replace(/[^0-9]/g, '');
        formState.increment.onChange(formattedText);
    }

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
                        <RandomNumberForm
                            rangeText={formState.range.value}
                            rangeError={formState.range.error}
                            onRangeChange={handleRangeInput}
                            incrementText={formState.increment.value}
                            incrementError={formState.increment.error}
                            onIncrementChange={handleIncrementInput}
                        />

                        <RandomNumberDisplay randomNumber={randomNumber} />

                        <RandomNumberActions
                            onGenerate={handleGenerate}
                            speechRecognitionAvailable={speechRecognitionAvailable}
                            micActive={micActive}
                            onMicToggle={handleMicToggle}
                        />

                        <View style={styles.contentSection}>
                            <Chevrons heading='Purpose' points={points} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};