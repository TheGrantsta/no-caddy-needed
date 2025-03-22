import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styles from "@/assets/stlyes";
import colours from "@/assets/colours";
import SubMenu from "@/components/SubMenu";
import { Link } from "expo-router";
import IconButton from "@/components/IconButton";
import { MaterialIcons } from "@expo/vector-icons";
import fontSizes from "@/assets/font-sizes";

export default function Practice() {
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('short-game');
  const [drillHistory, setDrillHistory] = useState<any[]>([]);

  const handleSubMenu = (sectionName: string) => {
    setSection(sectionName);
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const fetchData = () => {
    let temp: any[] = [];
    temp.push({ id: "1", col1: "Putting - Clock", col2: "Met", col3: "01/01" });
    temp.push({ id: "2", col1: "Pitching - Clock", col2: "Not met", col3: "01/01" });
    temp.push({ id: "3", col1: "Pitching - Ladder", col2: "Met", col3: "01/01" });

    setDrillHistory(temp);
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
                  <Text style={[styles.cell, styles.normalText, { color: colours.yellow, fontWeight: 'bold', flex: 7 / 12 }]}>Drill</Text>
                  <Text style={[styles.cell, styles.normalText, { color: colours.yellow, fontWeight: 'bold', flex: 2 / 12 }]}>Met</Text>
                  <Text style={[styles.cell, styles.normalText, { color: colours.yellow, fontWeight: 'bold', flex: 3 / 12 }]}>When</Text>
                </View>

                {/* Table Rows */}
                {drillHistory.map((item) => (
                  <View key={item.id} style={[styles.row]}>
                    <Text style={[styles.cell, { fontSize: fontSizes.normal, fontWeight: 'normal', textAlign: 'left', flex: 7 / 12 }]}>
                      {item.col1}
                    </Text>
                    <Text style={[styles.cell, { fontSize: fontSizes.normal, fontWeight: 'normal', flex: 2 / 12 }]}>
                      <MaterialIcons
                        name={item.col2 === 'Met' ? 'check' : 'clear'}
                        color={item.col2 === 'Met' ? colours.yellow : colours.errorText}
                        size={24} />
                    </Text>
                    <Text style={[styles.cell, { fontSize: fontSizes.normal, fontWeight: 'normal', flex: 3 / 12 }]}>
                      {item.col3}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  )
}
