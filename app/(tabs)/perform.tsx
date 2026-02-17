import { useRef, useState } from 'react';
import { Dimensions, FlatList, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import Chevrons from '../../components/Chevrons';
import SubMenu from '../../components/SubMenu';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { t } from '../../assets/i18n/i18n';

export default function Perform() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('approach');
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const points = [t('perform.conceptPoint1'), t('perform.conceptPoint2'), t('perform.conceptPoint3'), t('perform.conceptPoint4')];

  const { width } = Dimensions.get('window');

  const getApproachShotStats = () => {
    const approachStats: any[] = [];

    approachStats.push([t('perform.distanceHeader'), t('perform.fairwayHeader'), t('perform.roughHeader')]);
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

    puttingStats.push([t('perform.distanceFeetHeader'), t('perform.makeRateHeader')]);
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
    puttingStats.push([t('perform.inflectionPoint')])
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
      <SubMenu showSubMenu='perform' selectedItem={section} handleSubMenu={handleSubMenu} />

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

        {/* Approach */}
        {displaySection('approach') && (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, styles.marginTop]}>
                {t('perform.approachShots')}
              </Text>
            </View>
            <Text style={[styles.normalText, styles.marginBottom]}>
              {t('perform.approachSubtitle')}
            </Text>

            <Chevrons heading={t('perform.conceptsHeading')} points={points} />

            <Text style={[styles.normalText, styles.marginTop, { padding: 10 }]}>
              {t('perform.dispersionNote')}
            </Text>

            <Text style={styles.subHeaderText}>
              {t('perform.keyHeading')}
            </Text>

            <Text style={[styles.normalText, styles.marginBottom, { padding: 10 }]}>
              {t('perform.keyText')}
            </Text>
          </View>
        )}

        {/* Pros stats */}
        {displaySection('pros') && (
          <View>
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { marginTop: 10 }]}>
                  {t('perform.title')}
                </Text>
                <Text style={[styles.normalText, { marginBottom: 10 }]}>
                  {t('perform.subtitle')}
                </Text>
              </View>

              {activeIndex === 0 && (
                <View>
                  <Text style={[styles.headerText, styles.marginTop]}>
                    {t('perform.approachShotsTitle')}
                  </Text>
                  <Text style={[styles.normalText, styles.marginBottom]}>
                    {t('perform.approachShotsSubtitle')}
                  </Text>
                </View>
              )}

              {activeIndex === 1 && (
                <View>
                  <Text style={[styles.headerText, styles.marginTop]}>
                    {t('perform.puttsTitle')}
                  </Text>
                  <Text style={[styles.normalText, styles.marginBottom]}>
                    {t('perform.puttsSubtitle')}
                  </Text>
                </View>
              )}

              <View style={styles.horizontalScrollContainer}>
                <FlatList
                  testID='perform-flat-list'
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
                  {t('perform.approachSource')}
                </Text>
              </View>
            )}

            {activeIndex === 1 && (
              <View>
                <Text style={[styles.smallestText, styles.marginBottom]}>
                  {t('perform.puttsSourcePrefix')}
                  <Text style={{ fontStyle: 'italic' }}>
                    {t('perform.puttsSourceBook')}
                  </Text>{t('perform.puttsSourceAuthor')}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  )
};
