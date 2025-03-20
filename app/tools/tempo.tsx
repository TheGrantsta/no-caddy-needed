import { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import colours from '@/assets/colours';
import fontSizes from '@/assets/font-sizes';
import styles from '@/assets/stlyes';
import Chevrons from '@/components/Chevrons';
import Slider from '@react-native-community/slider';

export default function Tempo() {
    const [refreshing, setRefreshing] = useState(false);
    const [isLongGame, setIsLongGame] = useState(true);
    const [longGameSelectedValue, setLongGameSelectedValue] = useState(60);
    const [shortGameSelectedValue, setShortGameSelectedValue] = useState(60);
    const [tempo, setTempo] = useState(60);
    const [sound, setSound] = useState<Audio.Sound>();
    const [isPlaying, setIsPlaying] = useState(false);
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

    const handlePress = async (value: any) => {
        if (isLongGame) {
            setLongGameSelectedValue(value);
        } else {
            setShortGameSelectedValue(value);
        }

        setTempo(value);
        setIsPlaying(false);
        await stopLoop();
    };

    const handleHeaderPress = async (value: boolean) => {
        setIsLongGame(value);
        setIsPlaying(false);
        await stopLoop();
    };

    const resetTempo = async () => {
        setRefreshing(true);

        setTimeout(() => {
            setIsLongGame(true);
            setLongGameSelectedValue(60);
            setShortGameSelectedValue(60);
            setIsPlaying(false);
            stopLoop();
            setRefreshing(false);
        }, 750);
    };

    const onRefresh = () => {
        resetTempo();
    };

    const points = ['Focus on tempo, and not mechanics', 'Common fault: backswing is too slow, leading to a "bounce" at the top of the swing', 'Common misconception: amateurs believe they swing "too fast" even though they swing slower than professionals']

    const [value, setValue] = useState(60);

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
                    colors={[colours.yellow]}
                    tintColor={colours.yellow} />
            }>
                <View>
                    <Text style={styles.subHeaderText}>
                        Tempo training
                    </Text>
                    <Text style={styles.normalText}>
                        Swing with tempo to self organise
                    </Text>
                </View>

                <View style={localStyles.container}>
                    <Text style={[localStyles.title]}>Long game:</Text>

                    {/* Slider */}
                    <Slider
                        style={[localStyles.slider]}
                        minimumValue={60}
                        maximumValue={90}
                        step={6}
                        value={value}
                        onValueChange={setValue}
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

                    <Text style={[localStyles.valueText, styles.normalText, { color: colours.yellow }]}>
                        Beats per minute: {value}
                    </Text>
                </View>

                <View>
                    <Text style={styles.subHeaderText}>
                        Tempo training
                    </Text>
                    <Text style={styles.normalText}>
                        Swing with tempo to self organise
                    </Text>
                    <View style={{ paddingTop: 20, paddingBottom: 20 }}>
                        {/* Header row */}
                        <View style={localStyles.radioButtonRow}>
                            <TouchableOpacity
                                key={1}
                                style={[localStyles.radioButton, isLongGame ? localStyles.headerSelected : localStyles.headerNotSelected]}
                                onPress={() => handleHeaderPress(true)}>
                                <Text style={[localStyles.radioText, localStyles.rowHeading, isLongGame ? localStyles.headerTextSelected : localStyles.headerTextNotSelected]}>
                                    Long game
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                key={2}
                                style={[localStyles.radioButton, isLongGame ? localStyles.headerNotSelected : localStyles.headerSelected]}
                                onPress={() => handleHeaderPress(false)}>
                                <Text style={[localStyles.radioText, localStyles.rowHeading, isLongGame ? localStyles.headerTextNotSelected : localStyles.headerTextSelected]}>
                                    Short game
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Long game rows */}
                        {isLongGame && (
                            <View>
                                <View style={localStyles.radioButtonRow}>
                                    <TouchableOpacity
                                        key={1}
                                        style={[localStyles.radioButton, longGameSelectedValue === 60 ? localStyles.selected : '']}
                                        onPress={() => handlePress(60)}>
                                        <Text style={localStyles.radioText}>
                                            33/11
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        key={2}
                                        style={[localStyles.radioButton, longGameSelectedValue === 66 ? localStyles.selected : '']}
                                        onPress={() => handlePress(66)}>
                                        <Text style={localStyles.radioText}>
                                            30/10
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={localStyles.radioButtonRow}>
                                    <TouchableOpacity
                                        key={3}
                                        style={[localStyles.radioButton, longGameSelectedValue === 72 ? localStyles.selected : '']}
                                        onPress={() => handlePress(72)}>
                                        <Text style={localStyles.radioText}>
                                            27/9
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        key={4}
                                        style={[localStyles.radioButton, longGameSelectedValue === 78 ? localStyles.selected : '']}
                                        onPress={() => handlePress(78)}>
                                        <Text style={localStyles.radioText}>
                                            24/8
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={localStyles.radioButtonRow}>
                                    <TouchableOpacity
                                        key={5}
                                        style={[localStyles.radioButton, longGameSelectedValue === 84 ? localStyles.selected : '']}
                                        onPress={() => handlePress(84)}>
                                        <Text style={localStyles.radioText}>
                                            21/7
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        key={6}
                                        style={[localStyles.radioButton, longGameSelectedValue === 90 ? localStyles.selected : '']}
                                        onPress={() => handlePress(90)}>
                                        <Text style={localStyles.radioText}>
                                            18/6
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View>
                                    <Text style={styles.smallestText}>
                                        Based on John Garrity's work, long game tempo (start, take away, top & impact) is 3:1
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Short game rows */}
                        {!isLongGame && (
                            <View>
                                <View style={localStyles.radioButtonRow}>
                                    <TouchableOpacity
                                        key={1}
                                        style={[localStyles.radioButton, shortGameSelectedValue === 60 ? localStyles.selected : '']}
                                        onPress={() => handlePress(60)}>
                                        <Text style={localStyles.radioText}>
                                            26/13
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        key={2}
                                        style={[localStyles.radioButton, shortGameSelectedValue === 66 ? localStyles.selected : '']}
                                        onPress={() => handlePress(66)}>
                                        <Text style={localStyles.radioText}>
                                            24/12
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={localStyles.radioButtonRow}>
                                    <TouchableOpacity
                                        key={3}
                                        style={[localStyles.radioButton, shortGameSelectedValue === 72 ? localStyles.selected : '']}
                                        onPress={() => handlePress(72)}>
                                        <Text style={localStyles.radioText}>
                                            22/11
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        key={4}
                                        style={[localStyles.radioButton, shortGameSelectedValue === 78 ? localStyles.selected : '']}
                                        onPress={() => handlePress(78)}>
                                        <Text style={localStyles.radioText}>
                                            20/10
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={localStyles.radioButtonRow}>
                                    <TouchableOpacity
                                        key={3}
                                        style={[localStyles.radioButton, shortGameSelectedValue === 84 ? localStyles.selected : '']}
                                        onPress={() => handlePress(84)}>
                                        <Text style={localStyles.radioText}>
                                            18/9
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        key={4}
                                        style={[localStyles.radioButton, shortGameSelectedValue === 90 ? localStyles.selected : '']}
                                        onPress={() => handlePress(90)}>
                                        <Text style={localStyles.radioText}>
                                            16/8
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View>
                                    <Text style={[styles.normalText, { paddingTop: 10, fontSize: fontSizes.smallestText }]}>
                                        Based on John Garrity's work, short game tempo (start, take away, top & impact) is 2:1
                                    </Text>
                                </View>
                            </View>
                        )}

                    </View>

                    <View style={[styles.marginBottom]}>
                        <TouchableOpacity testID='save-button' style={styles.button} onPress={toggleStartStop}>
                            <Text style={styles.buttonText}>
                                {isPlaying ? 'Stop' : 'Play'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Chevrons heading='Why tempo training is important' points={points} />
            </ScrollView>
        </GestureHandlerRootView>
    );
};

const localStyles = StyleSheet.create({
    radioButtonRow: {
        flexDirection: 'row',
        flex: 2,
    },
    rowHeading: {
        color: colours.yellow,
        fontSize: fontSizes.subHeader,
    },
    headerSelected: {
        borderColor: colours.yellow,
        backgroundColor: colours.yellow,
    },
    headerNotSelected: {
        borderColor: colours.yellow,
        backgroundColor: colours.backgroundAlternate,
    },
    headerTextSelected: {
        color: colours.black,
    },
    headerTextNotSelected: {
        color: colours.yellow,
    },
    radioButton: {
        width: '50%',
        padding: 15,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colours.yellow,
        backgroundColor: colours.backgroundAlternate,
    },
    selected: {
        borderColor: colours.yellow,
        backgroundColor: colours.yellow,
        color: colours.black,
    },
    radioText: {
        fontSize: fontSizes.smallText,
        fontWeight: '500',
    },
    container: { padding: 20, alignItems: "center" },
    title: { fontSize: fontSizes.subHeader, color: colours.yellow, marginBottom: 10 },
    slider: { width: "90%", height: 40 },
    labelsContainer: { flexDirection: "row", justifyContent: "space-between", width: "90%", marginTop: 5 },
    label: { fontSize: fontSizes.normal, color: colours.yellow },
    valueText: { marginTop: 10, fontSize: 18, fontWeight: "bold" },
});
