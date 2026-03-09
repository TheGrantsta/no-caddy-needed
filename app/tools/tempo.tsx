import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Chevrons from '@/components/Chevrons';
import Slider from '@react-native-community/slider';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';

export default function Tempo() {
    const colours = useThemeColours();
    const styles = useStyles();
    const { landscapePadding } = useOrientation();
    const [refreshing, setRefreshing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(60);
    const player = useAudioPlayer(require('../../assets/single-beep.wav'));
    const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        setAudioModeAsync({
            allowsRecording: false,
            shouldPlayInBackground: false,
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
    };

    const startLoop = async () => {
        const interval = (60 / tempo) * 1000;

        timeoutRef.current = setInterval(async () => {
            await playSound();
        }, interval);
    };

    const toggleStartStop = async () => {
        setIsPlaying(!isPlaying);

        if (isPlaying) {
            await stopLoop();
        } else {
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

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setTempo(60);
            setIsPlaying(false);
            stopLoop();
            setRefreshing(false);
        }, 750);
    };

    const points = ['Tempo: focus on flow, and not mechanics', 'Fault: backswing is too slow, leading to a "bounce" at the top of the swing', 'Misconception: amateurs believe they swing "too fast" even though they swing slower than professionals - sequence over speed']

    const localStyles = styles.tempoTool;

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
                    colors={[colours.yellow]}
                    tintColor={colours.yellow} />
            }>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.headerText, styles.marginTop]}>
                            Tempo training
                        </Text>
                        <Text style={[styles.normalText, { margin: 5 }]}>
                            Swing with tempo to self organise
                        </Text>
                    </View>

                    <View style={localStyles.container}>
                        <Slider
                            style={[localStyles.slider]}
                            minimumValue={60}
                            maximumValue={120}
                            step={12}
                            value={tempo}
                            onValueChange={tempoValueChange}
                            minimumTrackTintColor={colours.yellow}
                            maximumTrackTintColor={colours.yellow}
                            thumbTintColor={colours.yellow}
                        />

                        {/* Labels */}
                        <View style={localStyles.labelsContainer}>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <Text key={num} style={[localStyles.label]}>
                                    {num === 1 ? 'slow' : num === 6 ? 'fast' : '|'}
                                </Text>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'nowrap', flex: 1, alignContent: 'space-evenly' }}>
                            <Text style={[localStyles.valueText, styles.normalText, { color: colours.yellow, padding: 5 }]}>
                                Beats per minute: {tempo}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.largeButton} onPress={toggleStartStop}>
                            <Text style={styles.buttonText}>{isPlaying ? 'Stop' : 'Play'}</Text>
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.smallestText, styles.marginTop, styles.marginBottom]}>
                                Based on John Garrity's work, long game tempo (start, take away, top & impact) is 3:1 & short game tempo is 2:1
                            </Text>
                        </View>

                        <Chevrons heading='Why tempo training is important' points={points} />
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};
