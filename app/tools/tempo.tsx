import { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import Chevrons from '@/components/Chevrons';
import Slider from '@react-native-community/slider';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';
import { t } from '@/assets/i18n/i18n';

export default function Tempo() {
    const colours = useThemeColours();
    const styles = useStyles();
    const { landscapePadding } = useOrientation();
    const [refreshing, setRefreshing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(60);
    const [sound, setSound] = useState<Audio.Sound>();
    const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        loadSound();

        return () => {
            if (sound) {
                sound.unloadAsync();
            };

            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
            };
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSound = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: false,
                playsInSilentModeIOS: true,
            });

            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/single-beep.wav')
            );

            setSound(sound);
        } catch (error) {
            console.error('Error loading sound:', error);
        }
    }

    const playSound = async () => {
        try {
            if (sound) {
                await sound.playAsync();
                await sound.replayAsync();
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const stopSound = async () => {
        if (sound) {
            await sound.stopAsync();
        }
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

    const points = [t('tempo.whyPoint1'), t('tempo.whyPoint2'), t('tempo.whyPoint3')]

    const localStyles = useMemo(() => StyleSheet.create({
        container: {
            padding: 20,
            alignItems: "center"
        },
        title: {
            fontSize: fontSizes.subHeader,
            color: colours.yellow,
            marginBottom: 10
        },
        slider: {
            width: "90%",
            height: 40
        },
        labelsContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "90%",
            marginTop: 5
        },
        label: {
            fontSize: fontSizes.normal,
            color: colours.yellow
        },
        valueText: {
            marginTop: 10,
            fontSize: 18,
            fontWeight: "bold"
        },
    }), [colours]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>
                        {t('common.releaseToUpdate')}
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
                            {t('tempo.title')}
                        </Text>
                        <Text style={[styles.normalText, { margin: 5 }]}>
                            {t('tempo.subtitle')}
                        </Text>
                    </View>

                    <View style={localStyles.container}>
                        <Text style={[localStyles.title]}>{t('tempo.tempoLabel')}</Text>

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
                                    {num === 1 ? t('tempo.slow') : num === 6 ? t('tempo.fast') : t('tempo.separator')}
                                </Text>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'nowrap', flex: 1, alignContent: 'space-evenly' }}>
                            <Text style={[localStyles.valueText, styles.normalText, { color: colours.yellow, padding: 5 }]}>
                                {t('tempo.bpm', { tempo })}
                            </Text>

                            <TouchableOpacity style={{ padding: 5 }} onPress={toggleStartStop}>
                                <MaterialIcons name={isPlaying ? "stop-circle" : "play-circle-fill"} color={colours.yellow} size={36} />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.smallestText}>
                                {t('tempo.garrity')}
                            </Text>
                        </View>

                        <Chevrons heading={t('tempo.whyHeading')} points={points} />
                    </View>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};
