import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { useToast } from 'react-native-toast-notifications';
import Chevrons from '../../components/Chevrons';
import SubMenu from '../../components/SubMenu';
import WedgeChart from '../../components/WedgeChart';
import Tiger5Tally from '../../components/Tiger5Tally';
import { insertTiger5RoundService, getAllTiger5RoundsService, Tiger5Round } from '../../service/DbService';
import styles from '../../assets/stlyes';
import colours from '../../assets/colours';
import fontSizes from '../../assets/font-sizes';

export default function Course() {
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('tiger-5');
  const [activeIndex, setActiveIndex] = useState(0);
  const [tiger5Rounds, setTiger5Rounds] = useState<Tiger5Round[]>([]);
  const [tiger5RoundActive, setTiger5RoundActive] = useState(false);
  const flatListRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    setTiger5Rounds(getAllTiger5RoundsService());
  }, []);

  const points = ['Target: centre of the green', 'Aim: play for your shot shape *', 'Yardage: closer to the back edge'];
  const benefits = ['Improve distance control', 'Better course management', 'Eliminate guesswork'];

  const { width } = Dimensions.get('window');

  const getApproachShotStats = () => {
    const approachStats: any[] = [];

    approachStats.push(['Distance', 'Fairway', 'Rough']);
    approachStats.push(['225-250', '44\'10"', '56\'2"']);
    approachStats.push(['200-225', '42\'5"', '54\'6"']);
    approachStats.push(['175-200', '34\'1"', '44\'8"']);
    approachStats.push(['150-175', '27\'8"', '33\'4"']);
    approachStats.push(['125-150', '23\'6"', '37\'9"']);
    approachStats.push(['100-125', '20\'3"', '32\'9"']);
    approachStats.push(['75-100', '17\'9"', '27\'8"']);
    approachStats.push(['50-75', '15\'11"', '24\'6"']);

    return approachStats;
  };

  const getPuttingStats = () => {
    const puttingStats: any[] = [];

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

  const proStats: any[] = [];
  proStats.push(getApproachShotStats());
  proStats.push(getPuttingStats());

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setSection('tiger-5');
      setTiger5Rounds(getAllTiger5RoundsService());
      setRefreshing(false);
    }, 750);
  };

  const handleEndTiger5Round = (threePutts: number, doubleBogeys: number, bogeysPar5: number, bogeysInside9Iron: number, doubleChips: number) => {
    insertTiger5RoundService(threePutts, doubleBogeys, bogeysPar5, bogeysInside9Iron, doubleChips).then((success) => {
      const msg = success ? 'Round saved' : 'Round not saved';

      toast.show(msg, {
        type: success ? 'success' : 'danger',
        textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
        style: {
          borderLeftColor: success ? colours.green : colours.errorText,
          borderLeftWidth: 10,
          backgroundColor: colours.yellow,
        },
      });

      if (success) {
        setTiger5Rounds(getAllTiger5RoundsService());
      }
    });
  };

  const handleSubMenu = (sectionName: string) => {
    setSection(sectionName);
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const renderItem = ({ item }: any) => (
    <ScrollView style={[styles.container, styles.scrollWrapper, { maxHeight: 350, overflow: 'hidden' }]}>
      {
        item.map((row: any, rowIndex: number) => (
          <View key={rowIndex} style={[styles.row, { width: width * 0.9 }]}>
            {row.map((cell: any, colIndex: number) => (
              <View key={colIndex} style={{
                flex: 1, padding: 3, alignItems: "center", justifyContent: "center",
              }}>
                <Text style={[rowIndex === 0 ? styles.header : styles.normalText, { padding: 5 }]}>
                  {cell}
                </Text>
              </View>
            ))}
          </View>
        ))}
    </ScrollView>
  );

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
                * Your shot shape might be different with different clubs; for example, draw your wedges & fade your mid-irons
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
          <View>
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { marginTop: 10 }]}>
                  On course
                </Text>
                <Text style={[styles.normalText, { marginBottom: 10 }]}>
                  Manage your expectations, better!
                </Text>
              </View>

              {activeIndex === 0 && (
                <View>
                  <Text style={[styles.headerText, styles.marginTop]}>
                    Approach shots
                  </Text>
                  <Text style={[styles.normalText, styles.marginBottom]}>
                    Average proximity to the hole
                  </Text>
                </View>
              )}

              {activeIndex === 1 && (
                <View>
                  <Text style={[styles.headerText, styles.marginTop]}>
                    Putts
                  </Text>
                  <Text style={[styles.normalText, styles.marginBottom]}>
                    Professional male golfer make percentages
                  </Text>
                </View>
              )}

              <View style={styles.horizontalScrollContainer}>
                <FlatList
                  testID='on-course-flat-list'
                  ref={flatListRef}
                  data={proStats}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={renderItem}
                />
              </View>
            </View>

            <View style={styles.scrollIndicatorContainer}>
              {proStats.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollIndicatorDot,
                    activeIndex === index && styles.scrollActiveDot,
                  ]}
                />
              ))}
            </View>

            {activeIndex === 0 && (
              <View>
                <Text style={[styles.smallestText, styles.marginBottom]}>
                  Source: PGA tour online statistics website
                </Text>
              </View>
            )}

            {activeIndex === 1 && (
              <View>
                <Text style={[styles.smallestText, styles.marginBottom]}>
                  Source:
                  <Text style={{ fontStyle: 'italic' }}>
                    The Lost Art of Putting: Introducing the Six Putting Performance Principles
                  </Text> by Gary Nicol & Karl Morris
                </Text>
              </View>
            )}
          </View>
        )}
        {/* Tiger 5 */}
        {displaySection('tiger-5') && (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, styles.marginTop]}>
                Tiger 5
              </Text>
              <Text style={[styles.normalText, styles.marginBottom]}>
                {tiger5RoundActive ? 'Round in progress' : 'Track avoidable mistakes during your round'}
              </Text>
            </View>

            <Tiger5Tally onEndRound={handleEndTiger5Round} onRoundStateChange={setTiger5RoundActive} />

            {!tiger5RoundActive && tiger5Rounds.length === 0 && (
              <View style={styles.headerContainer}>
                <Text style={[styles.normalText, styles.marginTop]}>
                  No round history yet
                </Text>
              </View>
            )}

            {!tiger5RoundActive && tiger5Rounds.length > 0 && (
              <View style={{ padding: 15 }}>
                <Text style={[styles.subHeaderText, { textAlign: 'center' }]}>
                  Round history
                </Text>
                <View style={[styles.row, { justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colours.yellow }]}>
                  <Text style={styles.header}>Date</Text>
                  <Text style={styles.header}>Total</Text>
                </View>
                {tiger5Rounds.map((round) => (
                  <View key={round.Id} style={[styles.row, { justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colours.yellow }]}>
                    <Text style={styles.normalText}>{round.Created_At}</Text>
                    <Text style={styles.normalText}>{round.Total}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  )
};
