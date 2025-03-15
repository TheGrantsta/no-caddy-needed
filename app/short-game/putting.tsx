import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import SubMenu from "@/components/SubMenu";
import Game from "@/components/Game";
import Drill from "@/components/Drill";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";
import fontSizes from "@/assets/font-sizes";

export default function Putting() {
    const [refreshing, setRefreshing] = useState(false);
    const [section, setSection] = useState('putting-drills');

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    const saveDrillResultHandle = (label: string, result: boolean) => {
        // setMessageVisible(true);

        setTimeout(() => {
            // insertDrillResultService(label, result);
            // setMessageVisible(false);
        }, 750);
    };

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 750);
    };

    type drill = {
        label: string;
        iconName: keyof typeof MaterialIcons.glyphMap;
        target: string;
        objective: string;
        setup: string;
        howToPlay: string;
    };

    const drills: drill[] = [];

    drills.push({
        label: 'Clock',
        iconName: 'schedule',
        target: '8 / 10',
        objective: 'work your putting stroke and get better at 4\' putts',
        setup: '5 tees & 1 golf ball. Create a 4\' circle around the hole',
        howToPlay: 'go around twice. Ten putts in total. Repeat until you hit the target'
    });
    drills.push({
        label: 'Ladder',
        iconName: 'sort',
        target: '10 / 12',
        objective: 'improve lag putting distance control',
        setup: '5 tees & 3 golf balls. Place one tee at start, and then at 20\', 25\', 30\' & 40\'',
        howToPlay: 'putt to finish within 10% of distance. Repeat until you hit the target'
    });

    const games = [
        {
            header: 'Around the world!',
            objective: 'make putts from various distances from the hole',
            setup: 'place tees in a circle around the hole, at distances of 3, 5, 7 & 9 feet',
            howToPlay: 'start at one tee and move to the next when the putt is made. Track your personal best and aim to beat it'
        },
        {
            header: 'Ladder challenge!',
            objective: 'make 9 consecutive putts from a fixed distances',
            setup: 'place tees at 3, 5 & 7 feet and 3 balls',
            howToPlay: 'make 3 putts from each tee; if you miss, restart at 3 feet. Play until you complete the challenge'
        },
    ];

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <SubMenu showSubMenu='putting' selectedItem={section} handleSubMenu={handleSubMenu} />

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
                {/* Drills */}
                {displaySection('putting-drills') && (
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Text style={[styles.headerText, styles.marginTop]}>
                                Putting drills
                            </Text>
                            <Text style={[styles.normalText, { margin: 5 }]}>
                                Improve your mechanics and accuracy through focused, repetitive actions.
                            </Text>
                        </View>
                        <View>
                            {/* Drills */}
                            {drills.map((drill: any, index: number) => (
                                <View key={index}>
                                    <Drill label={drill.label} iconName={drill.iconName} target={drill.target} objective={drill.objective} setUp={drill.setup} howToPlay={drill.howToPlay} saveDrillResult={saveDrillResultHandle} />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Games */}
                {
                    displaySection('putting-games') && (
                        <View style={styles.container}>
                            <View style={styles.headerContainer}>
                                <Text style={[styles.headerText, styles.marginTop]}>
                                    Putting games
                                </Text>
                            </View>
                            <View>
                                <Game subHeading='Improve your accuracy, touch, consistency, and mental focus while keeping practice engaging. The pressure is designed to replicate game situations.' games={games} />
                            </View>
                        </View>
                    )
                }
            </ScrollView >

        </GestureHandlerRootView >
    )
};

const localStyles = StyleSheet.create({
    contentText: {
        marginTop: 5,
        marginRight: 10,
        fontSize: fontSizes.normal,
        color: colours.white,
    },
    toggleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 150,
    },
    toggleContainer: {
        width: 45,
        height: 15,
        borderRadius: 10,
        backgroundColor: colours.backgroundLight,
        justifyContent: 'center',
    },
    toggleOn: {
        backgroundColor: colours.yellow,
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colours.backgroundLight,
        alignSelf: 'flex-start',
    },
    circleOn: {
        alignSelf: 'flex-end',
    },
});
