import { useRef, useState } from "react";
import { Dimensions, FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";
import SubMenu from "@/components/SubMenu";
import { Link } from "expo-router";
import IconButton from "@/components/IconButton";
import { MaterialIcons } from "@expo/vector-icons";

export default function Practice() {
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('short-game');

  const handleSubMenu = (sectionName: string) => {
    setSection(sectionName);
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const tableData = [
    { id: "1", col1: "Putting - Clock", col2: "Met" },
    { id: "2", col1: "Pitching - Clock", col2: "Not met" },
    { id: "3", col1: "Pitching - Ladder", col2: "Met" },
  ];

  const renderRow = ({ item }: any) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { padding: 5, paddingLeft: 10, fontWeight: 'normal', textAlign: 'left' }]}>{item.col1}</Text>
      <Text style={[styles.cell, { padding: 5 }]}>
        <MaterialIcons
          name={item.col2 === 'Met' ? 'check' : 'clear'}
          color={item.col2 === 'Met' ? colours.yellow : colours.errorText}
          size={24} />
      </Text>
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
            <View style={styles.viewContainer}>
              <Text style={[styles.subHeaderText, styles.marginTop]}>
                Drill history
              </Text>
            </View>

            {/* Table example */}
            <ScrollView style={styles.container}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.row]}>
                  <Text style={[styles.cell, styles.subHeaderText, { paddingLeft: 10 }]}>Drill</Text>
                  <Text style={[styles.cell, styles.subHeaderText]}>Target</Text>
                </View>

                {/* Table Rows */}
                <FlatList
                  data={tableData}
                  renderItem={renderRow}
                  keyExtractor={(item) => item.id}
                />
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  )
}
