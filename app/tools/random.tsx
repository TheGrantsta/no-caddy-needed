import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getRandomNumber } from '../../assets/random-number';
import * as Speech from 'expo-speech';
import { getSettingsService } from '../../service/DbService';
import PageHeader from '@/components/PageHeader';
import { describeSequence } from '@/utils/randomSequence';
import RandomNumberForm from '@/components/RandomNumberForm';
import RandomNumberDisplay from '@/components/RandomNumberDisplay';
import RandomNumberActions from '@/components/RandomNumberActions';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';
import { useForm } from '../../hooks/useForm';
import { useToggle } from '../../hooks/useToggle';
import { validateNumber } from '../../assets/validation';
interface SpeechRecognitionEvent {
    results: { transcript: string; isFinal: boolean }[];
}

let ExpoSpeechRecognitionModule: { requestPermissionsAsync: () => Promise<{ granted: boolean }>; start: (opts: object) => void; stop: () => void } | null = null;
let useSpeechRecognitionEvent: (eventName: string, handler: (event: SpeechRecognitionEvent) => void) => void = () => {};
let speechRecognitionAvailable = false;
try {
    // Optional native module: a guarded require lets the tool still load when it is unavailable
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
    const router = useRouter();
    const { landscapePadding } = useOrientation();
    const [formState] = useForm({ from: '30', to: '100', increment: '10' });
    const [randomNumber, setRandomNumber] = useState(0);
    const [micActive, , setMicActive] = useToggle(false);
    const [micDenied, setMicDenied] = useState(false);
    const isStoppingRef = useRef(false);

    // Declared before the speech handler below, which calls it
    const handleGenerate = async () => {
        const fromError = validateNumber(formState.from.value, 'From');
        const toError = validateNumber(formState.to.value, 'To');
        const incrementError = validateNumber(formState.increment.value, 'Increment');

        if (fromError) {
            formState.from.setError(fromError);
        }
        if (toError) {
            formState.to.setError(toError);
        }
        if (incrementError) {
            formState.increment.setError(incrementError);
        }

        if (!fromError && !toError && !incrementError) {
            const range = `${formState.from.value}-${formState.to.value}`;
            const number = getRandomNumber(range, formState.increment.value, randomNumber);
            setRandomNumber(number);
            const settings = getSettingsService();
            if (number > 0 && settings.soundsEnabled) {
                Speech.stop();
                const options = await getVoiceOptions(settings.voice);
                Speech.speak(String(number), options);
            }
        }
    };

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
            setMicDenied(!granted);
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

    const handleFromInput = (text: string) => {
        formState.from.onChange(text.replace(/[^0-9]/g, ''));
    }

    const handleToInput = (text: string) => {
        formState.to.onChange(text.replace(/[^0-9]/g, ''));
    }

    const handleIncrementInput = (text: string) => {
        const formattedText = text.replace(/[^0-9]/g, '');
        formState.increment.onChange(formattedText);
    }

    const purposePoints: { heading: string; text: string }[] = [
        { heading: 'Realism', text: 'Practise like play' },
        { heading: 'Focus', text: 'Use pre-shot routine' },
        { heading: 'Evaluation', text: 'Access how well you did' },
    ];

    const caption = describeSequence(formState.from.value, formState.to.value, formState.increment.value);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <PageHeader title="Random number generator" onBack={() => router.back()} />

                <RandomNumberDisplay randomNumber={randomNumber} />

                <RandomNumberActions
                    onGenerate={handleGenerate}
                    speechRecognitionAvailable={speechRecognitionAvailable}
                    micActive={micActive}
                    micDenied={micDenied}
                    onMicToggle={handleMicToggle}
                />

                <RandomNumberForm
                    fromText={formState.from.value}
                    fromError={formState.from.error}
                    onFromChange={handleFromInput}
                    toText={formState.to.value}
                    toError={formState.to.error}
                    onToChange={handleToInput}
                    incrementText={formState.increment.value}
                    incrementError={formState.increment.error}
                    onIncrementChange={handleIncrementInput}
                    caption={caption}
                />

                <Text style={styles.randomPage.sectionLabel}>PURPOSE</Text>
                <View style={styles.randomPage.purposeCard}>
                    {purposePoints.map((point, index) => (
                        <View key={point.heading} testID={`purpose-row-${index}`} style={[styles.randomPage.purposeRow, index > 0 && styles.randomPage.purposeRowDivider]}>
                            <Text style={styles.randomPage.purposeHeading}>{point.heading}</Text>
                            <Text style={styles.randomPage.purposeText}>{point.text}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};