import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";
import SubMenu from "@/components/SubMenu";
import { Link } from "expo-router";
import IconButton from "@/components/IconButton";
import { MaterialIcons } from "@expo/vector-icons";
import fontSizes from "@/assets/font-sizes";
import { getAllDrillHistoryService } from "@/service/DbService";

export default function Practice() {
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('short-game');
  const [loading, setLoading] = useState(true);
  const [drillHistoryIndex, setDrillHistoryIndex] = useState(0);
  const [drillHistory, setDrillHistory] = useState<any[]>([]);
  const flatListRef = useRef(null);

  const handleSubMenu = (sectionName: string) => {
    setSection(sectionName);
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const fetchData = () => {
    try {
      const items = getAllDrillHistoryService();
      const pages = [items.slice(0, 5), items.slice(5)];

      setDrillHistory(pages);
    } catch (e) {
      console.error("Error fetching drill history:", e);
    } finally {
      setLoading(false);
    }
  };

  const { width } = Dimensions.get('window');

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);

    setDrillHistoryIndex(index);
  };

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 750);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <SubMenu showSubMenu='practice' selectedItem={section} handleSubMenu={handleSubMenu} />

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

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={[styles.headerText, styles.marginTop]}>
              Practice
            </Text>
            <Text style={[styles.normalText, styles.marginBottom]}>
              Make your practice time more effective
            </Text>
          </View>
        </View>

        {/* Short game */}
        {displaySection('short-game') && (
          <View>
            <View style={styles.viewContainer}>
              <Text style={[styles.subHeaderText, styles.marginTop]}>
                Short game practice
              </Text>

              <View style={styles.iconsContainer}>
                <Link href='../short-game/putting'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='adjust' label='Putting' size='medium' />
                  </View>
                </Link>

                <Link href='../short-game/chipping'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='filter-tilt-shift' label='Chipping' size='medium' />
                  </View>
                </Link>

                <Link href='../short-game/pitching'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='golf-course' label='Pitching' size='medium' />
                  </View>
                </Link>

                <Link href='../short-game/bunker'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='beach-access' label='Bunker play' size='medium' />
                  </View>
                </Link>
              </View>
            </View>

            <View>
              <Text style={[styles.normalText, styles.marginTop]}>
                Only you will know what you need to practice - be honest with yourself, identify shots you avoid or can't play, and give yourself time
              </Text>
            </View>
          </View>
        )}

        {/* Tools */}
        {displaySection('tools') && (
          <View>
            <View style={styles.viewContainer}>
              <Text style={[styles.subHeaderText, styles.marginTop]}>
                Practice tools
              </Text>

              <View style={styles.iconsContainer}>
                <Link href='../tools/tempo'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='music-note' label='Tempo' size='medium' />
                  </View>
                </Link>

                <Link href='../tools/random'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='shuffle-on' label='Random' size='medium' />
                  </View>
                </Link>
              </View>
            </View>
          </View>
        )}

        {/* Tools */}
        {displaySection('history') && (
          <View>
            {loading ? (
              <View>
                <ActivityIndicator size="large" color={colours.yellow} />
              </View>
            ) : (
              <View>
                <Text style={{
                  color: colours.yellow,
                  fontSize: fontSizes.subHeader,
                  alignItems: 'baseline',
                  padding: 6,
                  marginTop: 10
                }}>
                  Drill history
                </Text>

                <View style={styles.horizontalScrollContainer}>
                  <FlatList
                    ref={flatListRef}
                    data={drillHistory}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    renderItem={({ item }) => (
                      <View style={[localStyles.page, styles.scrollWrapper, { margin: 10 }]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.subHeaderText, { flex: 9 / 12 }]}>
                            Drill
                          </Text>
                          <Text style={[styles.subHeaderText, { flex: 1 / 12 }]}>
                            Met
                          </Text>
                          <Text style={[styles.subHeaderText, { flex: 2 / 12 }]}>
                            When
                          </Text>
                        </View>
                        <FlatList
                          data={item}
                          keyExtractor={(_, index) => index.toString()}
                          renderItem={({ item }) => (
                            <View style={[styles.horizontalScrollContainer, { width: width - 50 }]}>
                              <View style={[{ flexDirection: 'row' }]}>

                                <Text style={[styles.cell, { textAlign: 'left', flex: 7 / 12, borderWidth: 0 }]}>
                                  {item.Name}
                                </Text>
                                <Text style={[styles.cell, { flex: 2 / 12, borderWidth: 0 }]}>
                                  <MaterialIcons
                                    name={item.Result === 1 ? 'check' : 'clear'}
                                    color={item.Result === 1 ? colours.yellow : colours.errorText}
                                    size={24} />
                                </Text>
                                <Text style={[styles.cell, { flex: 3 / 12, borderWidth: 0 }]}>
                                  {item.Created_At}
                                </Text>
                              </View>
                            </View>
                          )}
                        />
                      </View>
                    )}
                  />
                </View>

                <View style={styles.scrollIndicatorContainer}>
                  {drillHistory.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.scrollIndicatorDot,
                        drillHistoryIndex === index && styles.scrollActiveDot,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView >
  )
};

const localStyles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    width: 100,
    height: 100,
    backgroundColor: "#4A90E2",
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

