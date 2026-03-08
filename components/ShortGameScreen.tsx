import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { insertDrillResultService, getDrillsByCategoryService, toggleDrillIsActiveService, getGamesByCategoryService, deleteGameService, restoreGameService } from "@/service/DbService";
import SubMenu from "@/components/SubMenu";
import Drill from "@/components/Drill";
import Game from "@/components/Game";
import AddDrillForm from "@/components/AddDrillForm";
import AddGameForm from "@/components/AddGameForm";
import { useStyles } from "@/hooks/useStyles";
import { useThemeColours } from "@/context/ThemeContext";
import { useOrientation } from "@/hooks/useOrientation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppToast } from "@/hooks/useAppToast";
import { ShortGameConfig, DrillData, GameData } from "@/types/ShortGame";
import fontSizes from "@/assets/font-sizes";

type Props = {
    config: ShortGameConfig;
};

const ShortGameScreen = ({ config }: Props) => {
    const { category, drillsFooter, gamesFooter } = config;
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const { bottom: bottomInset } = useSafeAreaInsets();
    const { showResult } = useAppToast();
    const [refreshing, setRefreshing] = useState(false);
    const [section, setSection] = useState(`${category}-drills`);
    const [gameActiveIndex, setGameActiveIndex] = useState(0);
    const [drillActiveIndex, setDrillActiveIndex] = useState(0);
    const [drills, setDrills] = useState<DrillData[]>([]);
    const [games, setGames] = useState<GameData[]>([]);
    const [showAddDrillForm, setShowAddDrillForm] = useState(false);
    const [showAddGameForm, setShowAddGameForm] = useState(false);
    const [lastDeletedGameId, setLastDeletedGameId] = useState<number | null>(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        setDrills(getDrillsByCategoryService(category));
        setGames(getGamesByCategoryService(category));
    }, [category]);

    useEffect(() => {
        if (lastDeletedGameId === null) return;
        const timer = setTimeout(() => {
            setLastDeletedGameId(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [lastDeletedGameId]);

    const { width } = Dimensions.get('window');

    const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);

    const handleSubMenu = (sectionName: string) => {
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    const saveDrillResultHandle = (label: string, result: boolean, drillId: number | null) => {
        insertDrillResultService(`${categoryCapitalized} - ${label}`, result, drillId).then((success) => {
            showResult(success, "Drill result saved", "Drill result not saved");
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
            <View style={[styles.container, styles.scrollWrapper, { alignSelf: 'stretch' }]}>
                <ScrollView testID='game-item-scroll' nestedScrollEnabled>
                    <Game
                        header={item.header}
                        objective={item.objective}
                        setUp={item.setup}
                        howToPlay={item.howToPlay}
                        onDelete={() => {
                            if (item.id !== undefined) {
                                deleteGameService(item.id).then(() => {
                                    setLastDeletedGameId(item.id!);
                                    setGames(getGamesByCategoryService(category));
                                });
                            }
                        }}
                    />
                </ScrollView>
            </View>
        </View>
    );

    const renderDrillItem = ({ item }: { item: DrillData }) => (
        <View style={styles.scrollItemContainer}>
            <View style={[styles.container, styles.scrollWrapper, { alignSelf: 'stretch' }]}>
                <ScrollView testID='drill-item-scroll' nestedScrollEnabled>
                    <Drill
                        label={item.label}
                        iconName={item.iconName}
                        target={item.target}
                        objective={item.objective}
                        setUp={item.setup}
                        howToPlay={item.howToPlay}
                        isActive={item.isActive}
                        saveDrillResult={(label, result) => saveDrillResultHandle(label, result, item.id ?? null)}
                        onToggleActive={(newIsActive) => {
                            if (item.id !== undefined) {
                                toggleDrillIsActiveService(item.id, newIsActive).then(() => {
                                    setDrills(getDrillsByCategoryService(category));
                                });
                            }
                        }}
                    />
                </ScrollView>
            </View>
        </View>
    );

    const onRefresh = () => {
        setRefreshing(true);
        setDrills(getDrillsByCategoryService(category));
        setGames(getGamesByCategoryService(category));

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
                        Release to update
                    </Text>
                </View>
            )}

            {lastDeletedGameId !== null && (
                <TouchableOpacity
                    testID='undo-game-delete'
                    style={[{
                        backgroundColor: colours.yellow, position: 'absolute', bottom: bottomInset, zIndex: 10, padding: 12,
                        borderColor: colours.errorText, borderLeftWidth: 10, width: '90%', alignSelf: 'center'
                    }]}
                    onPress={() => {
                        restoreGameService(lastDeletedGameId).then(() => {
                            setLastDeletedGameId(null);
                            setGames(getGamesByCategoryService(category));
                        });
                    }}>
                    <Text style={[styles.updateText, { color: colours.background, fontSize: fontSizes.normal, fontWeight: 'bold' }]}>Undo delete</Text>
                </TouchableOpacity>
            )}

            <ScrollView testID='main-scroll-view' style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
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
                                    {categoryCapitalized} drills
                                </Text>
                                <Text style={[styles.normalText, { margin: 10 }]}>
                                    Improve your mechanics and accuracy through focused, repetitive actions.
                                </Text>
                            </View>
                            <View>
                                {showAddDrillForm ? (
                                    <AddDrillForm
                                        category={category}
                                        onSaved={() => {
                                            setShowAddDrillForm(false);
                                            setDrills(getDrillsByCategoryService(category));
                                        }}
                                        onCancel={() => setShowAddDrillForm(false)}
                                    />
                                ) : (
                                    <>
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
                                            <Text style={[styles.normalText, styles.marginTop, { margin: 10 }]}>
                                                {drillsFooter}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            testID='add-drill-button'
                                            style={[styles.largeButton, { padding: 12, alignItems: 'center', alignSelf: 'center', marginTop: 20 }]}
                                            onPress={() => setShowAddDrillForm(true)}>
                                            <Text style={styles.buttonText}>Add your own drill</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
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
                                        {categoryCapitalized} games
                                    </Text>
                                </View>
                                <View>
                                    <Text style={[styles.normalText, { margin: 10 }]}>
                                        Improve your accuracy, touch, consistency, and mental focus while keeping practice engaging
                                    </Text>
                                </View>

                                {showAddGameForm ? (
                                    <AddGameForm
                                        category={category}
                                        onSaved={() => {
                                            setShowAddGameForm(false);
                                            setGames(getGamesByCategoryService(category));
                                        }}
                                        onCancel={() => setShowAddGameForm(false)}
                                    />
                                ) : (
                                    <>
                                        {games.length === 0 ? (
                                            <Text style={[styles.normalText, { margin: 10 }]}>
                                                No games yet — add your own below!
                                            </Text>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
                                        <View>
                                            <Text style={[styles.normalText, styles.marginTop, { margin: 10 }]}>
                                                {gamesFooter}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            testID='add-game-button'
                                            style={[styles.largeButton, { padding: 12, alignItems: 'center', alignSelf: 'center', marginTop: 20 }]}
                                            onPress={() => setShowAddGameForm(true)}>
                                            <Text style={styles.buttonText}>Add your own game</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    )
                }
            </ScrollView>
        </GestureHandlerRootView>
    );
};

export default ShortGameScreen;
