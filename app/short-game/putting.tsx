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

export default function Putting() {
    const [refreshing, setRefreshing] = useState(false);
    const [section, setSection] = useState('putting-drills');
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
        insertDrillResultService(`Putting - ${label}`, result).then((success) => {
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
        label: 'Gate',
        iconName: 'data-array',
        target: '8 / 10',
        objective: 'improve accuracy and stroke path',
        setup: 'place two tees just wider than your putter head & practice putting from 3\' through the "gate" without hitting the tees',
        howToPlay: 'ten putts in total. Repeat until you hit the target'
    });
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
            howToPlay: 'start at one tee and move to the next when the putt is made; if you miss, restart at 3 feet. Play until you complete the challenge'
        },
        {
            header: 'Ladder challenge!',
            objective: 'make 9 consecutive putts from a fixed distances',
            setup: 'place tees at 3, 5 & 7 feet and 3 balls',
            howToPlay: 'make 3 putts from each tee; if you miss, restart at 3 feet. Play until you complete the challenge'
        },
        {
            header: 'Par 18!',
            objective: 'treat each hole as a par-2 and aim to finish below par',
            setup: 'create 9 different putting “holes” on the practice green, with different slopes and breaks',
            howToPlay: 'complete the "course" by holing out on each hole. Play until you break "par"'
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

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colours.yellow} />
            }>

                {/* Drills */}
                {
                    displaySection('putting-drills') && (
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
                    displaySection('putting-games') && (
                        <View>
                            <View style={styles.container}>
                                <View style={styles.headerContainer}>
                                    <Text style={[styles.headerText, styles.marginTop]}>
                                        Putting games
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
                                    The games are designed to replicate the pressure of game situations, so only use ONE ball
                                </Text>
                            </View>
                        </View>
                    )
                }
            </ScrollView >
        </GestureHandlerRootView >
    )
};
