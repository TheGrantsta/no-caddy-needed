import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import Chevrons from '../../components/Chevrons';
import SubMenu from '../../components/SubMenu';
import WedgeChart from '../../components/WedgeChart';
import styles from '../../assets/stlyes';
import colours from '../../assets/colours';
import SmallButton from '@/components/SmallButton';

export default function Course() {
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('approach');
  const [statsApproach, setStatsApproach] = useState(true);
  const points = ['Target: centre of the green', 'Aim: play for your shot shape *', 'Yardage: closer to the back edge'];
  const benefits = ['Improve distance control', 'Better course management', 'Eliminate guesswork'];

  const getApproachShotStats = () => {
    const approachStats: any[][] = [];
    approachStats.push(['Distance', 'Fairway', 'Rough']);
    approachStats.push(['125-150', '23"6\'', '37"9\'']);
    approachStats.push(['100-125', '20"3\'', '32"9\'']);
    approachStats.push(['75-100', '17"9\'', '27"8\'']);
    approachStats.push(['50-75', '15"11\'', '24"6\'']);
    return approachStats;
  };

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setSection('approach');
      setRefreshing(false);
    }, 750);
  };

  const handleSubMenu = (sectionName: string) => {
    setSection(sectionName);
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const handleStatsButton = () => {

  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubMenu showSubMenu='on-course' selectedItem={section} handleSubMenu={handleSubMenu} />

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

        {/* Approach */}
        {displaySection('approach') && (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, styles.marginTop]}>
                On course
              </Text>
              <Text style={[styles.normalText, styles.marginBottom, { padding: 10 }]}>
                Make better on course decisions & choose better targets
              </Text>

              <Chevrons heading='Approach shots' points={points} />

              <Text style={[styles.normalText, styles.marginTop, { padding: 10 }]}>
                * Your shot shape might be different with different clubs; for example, do you draw your wedges and fade your mid-irons?
              </Text>
              <Text style={[styles.normalText, styles.marginTop, { padding: 10 }]}>
                Know your tendencies including when hitting full & partial shots
              </Text>
            </View>
          </View>
        )}

        {/* Wedge chart */}
        {displaySection('wedge-chart') && (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { marginTop: 10 }]}>
                On course
              </Text>
              <Text style={[styles.normalText, { marginBottom: 10 }]}>
                Use your wedge chart to hit more greens
              </Text>
            </View>

            <WedgeChart isShowButtons={false} />

            <Chevrons heading='Benefits' points={benefits} />

          </View>
        )}

        {/* Wedge chart */}
        {displaySection('stats') && (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { marginTop: 10 }]}>
                On course
              </Text>
              <Text style={[styles.normalText, { marginBottom: 10 }]}>
                Manage your expectations, better!
              </Text>
            </View>

            {/* Buttons to toggle between approach shots and putting */}
            <SmallButton testId='stats-approach-shots-button' label='Approach' onPress={() => handleStatsButton()} />
            <SmallButton testId='stats-putting-button' label='Putting' onPress={() => handleStatsButton()} />

            {/* Approach shot stats */}
            {statsApproach && (
              <View>
                <Text style={[styles.subHeaderText, { marginTop: 10 }]}>
                  Approach shots
                </Text>
                <Text style={styles.normalText}>
                  Average proximity to the hole
                </Text>
                <View style={styles.table}>
                  {
                    getApproachShotStats().map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.row}>
                        {row.map((cell, colIndex) => (
                          <Text key={colIndex}
                            style={[styles.cell,
                            rowIndex === 0 ? styles.header : colIndex === 0 ? styles.bold : '']}>
                            {cell}
                          </Text>
                        ))}
                      </View>
                    ))
                  }
                </View>
              </View>
            )}

            {/* Putting stats */}

          </View>
        )}

      </ScrollView>
    </GestureHandlerRootView>
  )
}