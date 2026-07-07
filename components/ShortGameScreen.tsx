import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { insertDrillResultService, getDrillsByCategoryService, deleteDrillService, restoreDrillService, getGamesByCategoryService, deleteGameService, restoreGameService } from "@/service/DbService";
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

type TestItem = {
    type: 'drill' | 'game';
    id?: number;
    data: DrillData | GameData;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ShortGameScreen = ({ config }: Props) => {
    const { category } = config;
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const { bottom: bottomInset } = useSafeAreaInsets();
    const { showResult } = useAppToast();
    const [refreshing, setRefreshing] = useState(false);
    const [tests, setTests] = useState<TestItem[]>([]);
    const [testActiveIndex, setTestActiveIndex] = useState(0);
    const [showAddDrillForm, setShowAddDrillForm] = useState(false);
    const [showAddGameForm, setShowAddGameForm] = useState(false);
    const [lastDeleted, setLastDeleted] = useState<{ type: 'drill' | 'game'; id: number } | null>(null);
    const flatListRef = useRef(null);
    const isSavingDrillRef = useRef(false);

    useEffect(() => {
        const drills = getDrillsByCategoryService(category);
        const games = getGamesByCategoryService(category);
        const combined: TestItem[] = [
            ...drills.map(d => ({ type: 'drill' as const, id: d.id, data: d })),
            ...games.map(g => ({ type: 'game' as const, id: g.id, data: g })),
        ];
        setTests(combined);
    }, [category]);

    useEffect(() => {
        if (lastDeleted === null) return;
        const timer = setTimeout(() => {
            setLastDeleted(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [lastDeleted]);

    const categoryCapitalized = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const saveDrillResultHandle = (label: string, score: number, drillId: number | null, target?: string) => {
        if (isSavingDrillRef.current) return;
        isSavingDrillRef.current = true;
        const goalMatch = target?.match(/(\d+)\s*\/\s*(\d+)/);
        const goal = goalMatch ? parseInt(goalMatch[1]) : 0;
        const result = score >= goal;
        insertDrillResultService(`${categoryCapitalized} - ${label}`, result, drillId, score).then((success) => {
            showResult(success, "Test result saved", "Test result not saved");
            isSavingDrillRef.current = false;
        });
    };

    const handleTestScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        setTestActiveIndex(index);
    };

    const renderTestItem = useCallback(({ item }: { item: TestItem }) => (
        <View style={styles.scrollItemContainer}>
            <View style={[styles.container, styles.scrollWrapper, { alignSelf: 'stretch' }]}>
                <ScrollView testID={item.type === 'drill' ? 'drill-item-scroll' : 'game-item-scroll'} nestedScrollEnabled>
                    {item.type === 'drill' && item.data && 'label' in item.data ? (
                        <Drill
                            label={(item.data as DrillData).label}
                            iconName={(item.data as DrillData).iconName}
                            target={(item.data as DrillData).target}
                            objective={(item.data as DrillData).objective}
                            setUp={(item.data as DrillData).setup}
                            howToPlay={(item.data as DrillData).howToPlay}
                            saveDrillResult={(label, score) => saveDrillResultHandle(label, score, item.id ?? null, (item.data as DrillData).target)}
                            onDelete={() => {
                                if (item.id !== undefined) {
                                    deleteDrillService(item.id).then(() => {
                                        setLastDeleted({ type: 'drill', id: item.id! });
                                        setTests(tests.filter(t => !(t.type === 'drill' && t.id === item.id)));
                                    });
                                }
                            }}
                        />
                    ) : (
                        <Game
                            header={(item.data as GameData).header}
                            objective={(item.data as GameData).objective}
                            setUp={(item.data as GameData).setup}
                            howToPlay={(item.data as GameData).howToPlay}
                            onDelete={() => {
                                if (item.id !== undefined) {
                                    deleteGameService(item.id).then(() => {
                                        setLastDeleted({ type: 'game', id: item.id! });
                                        setTests(tests.filter(t => !(t.type === 'game' && t.id === item.id)));
                                    });
                                }
                            }}
                        />
                    )}
                </ScrollView>
            </View>
        </View>
    ), [styles, tests, saveDrillResultHandle]);

    const onRefresh = () => {
        setRefreshing(true);
        const drills = getDrillsByCategoryService(category);
        const games = getGamesByCategoryService(category);
        const combined: TestItem[] = [
            ...drills.map(d => ({ type: 'drill' as const, id: d.id, data: d })),
            ...games.map(g => ({ type: 'game' as const, id: g.id, data: g })),
        ];
        setTests(combined);
        setTimeout(() => {
            setRefreshing(false);
        }, 750);
    };

    const handleAddFormClose = () => {
        setShowAddDrillForm(false);
        setShowAddGameForm(false);
        const drills = getDrillsByCategoryService(category);
        const games = getGamesByCategoryService(category);
        const combined: TestItem[] = [
            ...drills.map(d => ({ type: 'drill' as const, id: d.id, data: d })),
            ...games.map(g => ({ type: 'game' as const, id: g.id, data: g })),
        ];
        setTests(combined);
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            {lastDeleted !== null && (
                <TouchableOpacity
                    testID={lastDeleted.type === 'drill' ? 'undo-drill-delete' : 'undo-game-delete'}
                    style={[{
                        backgroundColor: colours.primary, position: 'absolute', bottom: bottomInset, zIndex: 10, padding: 12,
                        borderColor: colours.red, borderLeftWidth: 10, width: '90%', alignSelf: 'center'
                    }]}
                    onPress={() => {
                        if (lastDeleted.type === 'drill') {
                            restoreDrillService(lastDeleted.id).then(() => {
                                setLastDeleted(null);
                                onRefresh();
                            });
                        } else {
                            restoreGameService(lastDeleted.id).then(() => {
                                setLastDeleted(null);
                                onRefresh();
                            });
                        }
                    }}>
                    <Text style={[styles.updateText, { color: colours.background, fontSize: fontSizes.normal, fontWeight: 'bold' }]}>Undo delete</Text>
                </TouchableOpacity>
            )}

            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>
                        Release to update
                    </Text>
                </View>
            )}

            <ScrollView testID='main-scroll-view' style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colours.primary} />
            }>

                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={[styles.headerText, styles.marginTop]}>
                            {categoryCapitalized} tests
                        </Text>
                        <Text style={[styles.normalText, { margin: 10 }]}>
                            Practice with pressure to build confidence.
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View>
                        {showAddDrillForm ? (
                            <AddDrillForm
                                category={category}
                                onSaved={handleAddFormClose}
                                onCancel={() => setShowAddDrillForm(false)}
                            />
                        ) : showAddGameForm ? (
                            <AddGameForm
                                category={category}
                                onSaved={handleAddFormClose}
                                onCancel={() => setShowAddGameForm(false)}
                            />
                        ) : (
                            <>
                                <View style={styles.horizontalScrollContainer}>
                                    <FlatList
                                        ref={flatListRef}
                                        data={tests}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onScroll={handleTestScroll}
                                        renderItem={renderTestItem}
                                        keyExtractor={(item, index) => `${item.type}-${item.id ?? index}`}
                                    />
                                </View>

                                <View style={styles.scrollIndicatorContainer}>
                                    {tests.map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.scrollIndicatorDot,
                                                testActiveIndex === index && styles.scrollActiveDot,
                                            ]}
                                        />
                                    ))}
                                </View>
                                <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
                                    <TouchableOpacity
                                        testID='add-drill-button'
                                        style={styles.button}
                                        onPress={() => setShowAddDrillForm(true)}>
                                        <Text style={styles.buttonText}>Add test</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>

            </ScrollView>
        </GestureHandlerRootView>
    );
};

export default ShortGameScreen;
