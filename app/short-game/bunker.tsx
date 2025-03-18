import { useRef, useState } from "react";
import { Dimensions, FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { useToast } from 'react-native-toast-notifications';
import { insertDrillResultService } from "@/service/DbService";
import SubMenu from "@/components/SubMenu";
import Drill from "@/components/Drill";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";
import fontSizes from "@/assets/font-sizes";
import Instructions from "@/components/Instructions";

export default function Bunker() {
    const [refreshing, setRefreshing] = useState(false);
    const [section, setSection] = useState('bunker-drills');
    const [gameActiveIndex, setGameActiveIndex] = useState(0);
    const [drillActiveIndex, setDrillActiveIndex] = useState(0);
    const flatListRef = useRef(null);
    const toast = useToast();

    const { width } = Dimensions.get('window');

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    const saveDrillResultHandle = (label: string, result: boolean) => {
        insertDrillResultService(label, result).then((success) => {
            const msg = success ? "Drill result saved" : "Drill result not saved";

            toast.show(msg, {
                type: success ? "success" : "danger",
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: {
                    borderLeftColor: success ? colours.green : colours.errorText,
                    borderLeftWidth: 10,
                    backgroundColor: colours.yellow
                }
            });
        });
    };

    const handleGameScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setGameActiveIndex(index);
    };

    const handleDrillScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setDrillActiveIndex(index);
    };

    const renderGameItem = ({ item }: any) => (
        <View style={styles.scrollItemContainer}>
            <View style={[styles.container, styles.scrollWrapper]}>
                <Text style={styles.subHeaderText}>
                    {item.header}
                </Text>
                <Instructions objective={item.objective} setUp={item.setup} howToPlay={item.howToPlay} />
            </View>
        </View>
    );


    const renderDrillItem = ({ item }: any) => (
        <View style={styles.scrollItemContainer}>
            <View style={[styles.container, styles.scrollWrapper]}>
                <Drill label={item.label} iconName={item.iconName} target={item.target} objective={item.objective} setUp={item.setup} howToPlay={item.howToPlay} saveDrillResult={saveDrillResultHandle} />
            </View>
        </View>
    );

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
        label: 'Three ball',
        iconName: 'track-changes',
        target: '3 / 3',
        objective: 'improve accuracy and distance control',
        setup: 'select a target between 50 - 100 yards away',
        howToPlay: 'hit 3 shots at the same target. Success is +/- 5 yards'
    });
    drills.push({
        label: 'Wedge',
        iconName: 'av-timer',
        target: '3 / 3',
        objective: 'improve ability to control landing spot',
        setup: 'hit 3 balls swinging to 9 o\'clock, 10 o\'clock & full',
        howToPlay: 'monitor landing spot. Success is +/- 5 yards'
    });
    drills.push({
        label: 'Ladder',
        iconName: 'sort',
        target: '10 / 12',
        objective: 'improve touch and feel',
        setup: 'place markers at 20, 30, 40, and 50 yards',
        howToPlay: 'hit 3 balls to each target, focusing on consistent carry distance. Repeat until you hit the target'
    });

    const games = [
        {
            header: 'Three club!',
            objective: 'develop feel and understand how each club performs',
            setup: 'choose three different wedges (e.g., lob wedge, sand wedge, and gap wedge)',
            howToPlay: 'hit to the same target with each club and compare results'
        },
        {
            header: 'Target challenge!',
            objective: 'control distance',
            setup: 'create a circle with tees at 3\' feet from the pin',
            howToPlay: 'hit 10 pitches to finish inside the target area. 2 points for inside, 1 point outside but on the green'
        },
        {
            header: '5-ball game!',
            objective: 'goal is to land all 5 on the green in a row, adding pressure',
            setup: 'hit 5 balls to a target from 30 - 50 yards',
            howToPlay: 'if you miss the green with one, restart the game'
        },
    ];

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <SubMenu showSubMenu='bunker' selectedItem={section} handleSubMenu={handleSubMenu} />

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
                {
                    displaySection('bunker-drills') && (
                        <View style={styles.container}>
                            <View style={styles.headerContainer}>
                                <Text style={[styles.headerText, styles.marginTop]}>
                                    Bunker drills
                                </Text>
                                <Text style={[styles.normalText, { margin: 5 }]}>
                                    Improve your mechanics and accuracy through focused, repetitive actions.
                                </Text>
                            </View>
                            <View>
                                <View style={styles.horizontalScrollContainer}>
                                    <FlatList
                                        ref={flatListRef}
                                        data={drills}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onScroll={handleDrillScroll}
                                        renderItem={renderDrillItem}
                                        keyExtractor={(_, index) => index.toString()}
                                    />
                                </View>

                                <View style={styles.scrollIndicatorContainer}>
                                    {drills.map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.scrollIndicatorDot,
                                                drillActiveIndex === index && styles.scrollActiveDot,
                                            ]}
                                        />
                                    ))}
                                </View>
                                <View>
                                    <Text style={[styles.normalText, styles.marginTop, { margin: 5 }]}>
                                        Practicing different techniques & improving your feel will increase your confidence & reduce missed opportunities
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )
                }

                {/* Games */}
                {
                    displaySection('bunker-games') && (
                        <View>
                            <View style={styles.container}>
                                <View style={styles.headerContainer}>
                                    <Text style={[styles.headerText, styles.marginTop]}>
                                        Bunker games
                                    </Text>
                                </View>
                                <View>
                                    <Text style={[styles.normalText, { margin: 5 }]}>
                                        Improve your accuracy, touch, consistency, and mental focus while keeping practice engaging
                                    </Text>
                                </View>

                                <View style={styles.horizontalScrollContainer}>
                                    <FlatList
                                        ref={flatListRef}
                                        data={games}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onScroll={handleGameScroll}
                                        renderItem={renderGameItem}
                                        keyExtractor={(_, index) => index.toString()}
                                    />
                                </View>
                            </View>

                            <View style={styles.scrollIndicatorContainer}>
                                {games.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.scrollIndicatorDot,
                                            gameActiveIndex === index && styles.scrollActiveDot,
                                        ]}
                                    />
                                ))}
                            </View>
                            <View>
                                <Text style={[styles.normalText, styles.marginTop, { margin: 5 }]}>
                                    The games are designed to replicate the pressure of game situations
                                </Text>
                            </View>
                        </View>
                    )
                }
            </ScrollView >
        </GestureHandlerRootView >
    )
};
