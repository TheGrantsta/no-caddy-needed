import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";
import SubMenu from "@/components/SubMenu";
import Game from "@/components/Game";

export default function Putting() {
    const [refreshing, setRefreshing] = useState(false);
    const [section, setSection] = useState('putting-drills');

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 750);
    };

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
    ]

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

                        </View>
                    </View>
                )}

                {/* Games */}
                {displaySection('putting-games') && (
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
                )}
            </ScrollView>

        </GestureHandlerRootView>
    )
}
