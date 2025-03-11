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

  const getPuttingStats = () => {
    const puttingStats: any[][] = [];
    puttingStats.push(['Distance (feet)', 'Make rate']);
    puttingStats.push(['1', '100%']);
    puttingStats.push(['2', '99%']);
    puttingStats.push(['3', '95%']);
    puttingStats.push(['4', '86%']);
    puttingStats.push(['5', '75%']);
    puttingStats.push(['6', '65%']);
    puttingStats.push(['7', '56%']);
    puttingStats.push(['8', '49%']);
    puttingStats.push(['9', '43%']);
    puttingStats.push(['10', '38%']);
    puttingStats.push(['15', '22%']);
    puttingStats.push(['20', '14%']);
    puttingStats.push(['25', '10%']);
    puttingStats.push(['30', '7%']);
    puttingStats.push(['35', '5%']);
    puttingStats.push(['Inflection point: more likely to 3 putt'])
    puttingStats.push(['40', '3%']);
    puttingStats.push(['45', '2%']);
    puttingStats.push(['50', '1%']);

    return puttingStats;
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

  const handleStatsButton = (selected: boolean) => {
    setStatsApproach(selected);
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
              <Text style={[styles.normalText, styles.marginBottom]}>
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

        {/* Pros stats */}
        {displaySection('pros') && (
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
            <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
              <SmallButton testId='stats-approach-shots-button' label='Approach' selected={statsApproach} onPress={() => handleStatsButton(true)} />
              <SmallButton testId='stats-putting-button' label='Putting' selected={!statsApproach} onPress={() => handleStatsButton(false)} />
            </View>

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
            {!statsApproach && (
              <View>
                <Text testID='stats-putting-heading' style={[styles.subHeaderText, { marginTop: 10 }]}>
                  Putts
                </Text>
                <Text style={styles.normalText}>
                  Professional male golfer make percentages
                </Text>
                <View style={styles.table}>
                  {
                    getPuttingStats().map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.row}>
                        {row.map((cell, colIndex) => (
                          <Text key={colIndex} style={[styles.cell, rowIndex === 0 ? styles.header : rowIndex % 2 === 0 ? '' : styles.alternateRow]}>
                            {cell}
                          </Text>
                        ))}
                      </View>
                    ))
                  }
                </View>
                <View>
                  <Text style={[styles.smallestText, { paddingBottom: 100 }]}>
                    Source: <Text style={{ fontStyle: 'italic' }}>The Lost Art of Putting: Introducing the Six Putting Performance Principles</Text> by Gary Nicol & Karl Morris
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Putting stats */}
        {displaySection('stats') && (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { marginTop: 10 }]}>
                On course
              </Text>
              <Text style={[styles.normalText, { marginBottom: 10 }]}>
                Stats you should be tracking!
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
    </GestureHandlerRootView>
  )
}