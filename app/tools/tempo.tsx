import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TempoSlider from '@/components/TempoSlider';
import TempoDisplay from '@/components/TempoDisplay';
import TempoControls from '@/components/TempoControls';
import TempoBeatDots from '@/components/TempoBeatDots';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { getSettingsService, saveSettingsService } from '@/service/DbService';

const MIN_TEMPO = 60;
const MAX_TEMPO = 120;
const BEATS_PER_BAR = 4;

const WHY_TEMPO_IS_IMPORTANT: { heading: string; text: string }[] = [
    { heading: 'Focus', text: 'Flow, not mechanics' },
    { heading: 'Fault', text: 'Backswing is too slow, leading to a “bounce” at the top of the swing' },
    { heading: 'Misconception', text: 'Amateurs believe they swing “too fast” even though they swing slower than professionals — sequence over speed' },
];

export default function Tempo() {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const { landscapePadding } = useOrientation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(() => getSettingsService().tempoBpm);
    const [activeBeat, setActiveBeat] = useState(-1);
    const player = useAudioPlayer(require('../../assets/single-beep.wav'));
    const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        setAudioModeAsync({
            allowsRecording: false,
            shouldPlayInBackground: true,
            playsInSilentMode: true,
            interruptionMode: 'mixWithOthers',
        }).catch((error) => {
            console.error('Error loading sound:', error);
        });

        return () => {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
            };
        };
    }, []);

    const playSound = async () => {
        try {
            await player.seekTo(0);
            player.play();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const stopSound = async () => {
        player.pause();
        await player.seekTo(0);
    };

    const stopLoop = async () => {
        await stopSound();

        if (timeoutRef.current) {
            clearInterval(timeoutRef.current);
        }
        setActiveBeat(-1);
    };

    const startLoop = async () => {
        const interval = (60 / tempo) * 1000;
        let beat = 0;

        timeoutRef.current = setInterval(async () => {
            setActiveBeat(beat);
            beat = (beat + 1) % BEATS_PER_BAR;
            await playSound();
        }, interval);
    };

    const toggleStartStop = async () => {
        setIsPlaying(!isPlaying);

        if (isPlaying) {
            await stopLoop();
        } else {
            // Persist the chosen tempo so it's restored next time the screen opens.
            saveSettingsService({ ...getSettingsService(), tempoBpm: tempo });
            await startLoop();
        }
    };

    const tempoValueChange = async (value: number) => {
        setTempo(value);

        if (isPlaying) {
            setIsPlaying(!isPlaying);
            await stopLoop();
        }
    }

    const stepTempo = (delta: number) => {
        tempoValueChange(Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, tempo + delta)));
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <View style={styles.tempoTool.pageHeader}>
                    <TouchableOpacity
                        testID="tempo-back-button"
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                        onPress={() => router.back()}
                        style={styles.tempoTool.backButton}
                    >
                        <MaterialIcons name="chevron-left" size={28} color={colours.black} />
                    </TouchableOpacity>
                    <View style={styles.tempoTool.pageTitleBlock}>
                        <Text style={styles.tempoTool.pageTitle}>Tempo training</Text>
                        <Text style={styles.tempoTool.pageSubtitle}>Swing with tempo to self organise</Text>
                    </View>
                    <View style={styles.tempoTool.pageSpacer} />
                </View>

                <View style={styles.tempoTool.card}>
                    <TempoBeatDots activeBeat={activeBeat} />

                    <TempoDisplay tempo={tempo} onStep={stepTempo} />

                    <TempoSlider
                        tempo={tempo}
                        onTempoChange={tempoValueChange}
                    />

                    <TempoControls
                        isPlaying={isPlaying}
                        onToggle={toggleStartStop}
                    />
                </View>

                <Text style={styles.tempoTool.whyLabel}>WHY TEMPO IS IMPORTANT</Text>
                <View style={styles.tempoTool.whyCard}>
                    {WHY_TEMPO_IS_IMPORTANT.map((item, index) => (
                        <View key={item.heading} style={[styles.tempoTool.whyRow, index > 0 && styles.tempoTool.whyRowDivider]}>
                            <Text style={styles.tempoTool.whyHeading}>{item.heading}</Text>
                            <Text style={styles.tempoTool.whyText}>{item.text}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};
