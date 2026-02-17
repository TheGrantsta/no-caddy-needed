import { useRef, useState } from "react";
import { Dimensions, FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { insertDrillResultService } from "@/service/DbService";
import SubMenu from "@/components/SubMenu";
import Drill from "@/components/Drill";
import Instructions from "@/components/Instructions";
import { useStyles } from "@/hooks/useStyles";
import { useThemeColours } from "@/context/ThemeContext";
import { useOrientation } from "@/hooks/useOrientation";
import { useAppToast } from "@/hooks/useAppToast";
import { ShortGameConfig, DrillData, GameData } from "@/types/ShortGame";
import { t } from "@/assets/i18n/i18n";

type Props = {
    config: ShortGameConfig;
};

const ShortGameScreen = ({ config }: Props) => {
    const { category, drills, games, drillsFooter, gamesFooter } = config;
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const { showResult } = useAppToast();
    const [refreshing, setRefreshing] = useState(false);
    const [section, setSection] = useState(`${category}-drills`);
    const [gameActiveIndex, setGameActiveIndex] = useState(0);
    const [drillActiveIndex, setDrillActiveIndex] = useState(0);
    const flatListRef = useRef(null);

    const { width } = Dimensions.get('window');

    const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    const saveDrillResultHandle = (label: string, result: boolean) => {
        insertDrillResultService(`${categoryCapitalized} - ${label}`, result).then((success) => {
            showResult(success, t('shortGame.drillResultSaved'), t('shortGame.drillResultNotSaved'));
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

    const renderGameItem = ({ item }: { item: GameData }) => (
        <View style={styles.scrollItemContainer}>
            <View style={[styles.container, styles.scrollWrapper]}>
                <Text style={styles.subHeaderText}>
                    {item.header}
                </Text>
                <Instructions objective={item.objective} setUp={item.setup} howToPlay={item.howToPlay} />
            </View>
        </View>
    );

    const renderDrillItem = ({ item }: { item: DrillData }) => (
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

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <SubMenu showSubMenu={category} selectedItem={section} handleSubMenu={handleSubMenu} />

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
                    tintColor={colours.yellow} />
            }>

                {/* Drills */}
                {
                    displaySection(`${category}-drills`) && (
                        <View style={styles.container}>
                            <View style={styles.headerContainer}>
                                <Text style={[styles.headerText, styles.marginTop]}>
                                    {t('shortGame.drillsSuffix', { category: categoryCapitalized })}
                                </Text>
                                <Text style={[styles.normalText, { margin: 5 }]}>
                                    {t('shortGame.drillsDescription')}
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
                                        {drillsFooter}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )
                }

                {/* Games */}
                {
                    displaySection(`${category}-games`) && (
                        <View>
                            <View style={styles.container}>
                                <View style={styles.headerContainer}>
                                    <Text style={[styles.headerText, styles.marginTop]}>
                                        {t('shortGame.gamesSuffix', { category: categoryCapitalized })}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={[styles.normalText, { margin: 5 }]}>
                                        {t('shortGame.gamesDescription')}
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
                                    {gamesFooter}
                                </Text>
                            </View>
                        </View>
                    )
                }
            </ScrollView >
        </GestureHandlerRootView >
    );
};

export default ShortGameScreen;
