import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import IconButton from '@/components/IconButton';


export default function HomeScreen() {
  const styles = useStyles();
  const colours = useThemeColours();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 750);
  };

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      {refreshing && (
        <View style={styles.updateOverlay}>
          <Text style={styles.updateText}>
            Release to update
          </Text>
        </View>
      )}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colours.yellow} />
      }>
        <View style={styles.viewContainer}>
          <Text style={[styles.headerText, styles.marginTop]}>
            No caddy needed!
          </Text>
          <Text style={[styles.normalText, styles.marginBottom]}>
            Smarter play, practice & course expectations
          </Text>

          <View style={[styles.iconsContainer, styles.marginTop]}>
            <Link href='/play'>
              <View style={styles.iconContainer}>
                <IconButton iconName='sports-golf' label='Play' size='medium' />
              </View>
            </Link>
            <Link href='/practice'>
              <View style={styles.iconContainer}>
                <IconButton iconName='golf-course' label='Practice' size='medium' />
              </View>
            </Link>
            <Link href='/paradigms'>
              <View style={styles.iconContainer}>
                <IconButton iconName='lightbulb' label='Paradigms' size='medium' />
              </View>
            </Link>
          </View>

          <Text style={styles.subHeaderText}>
            Be your own best caddy
          </Text>

          <Text style={[styles.normalText, styles.marginTop]}>
            Golf is not a game of perfect, or having a perfect swing
          </Text>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
