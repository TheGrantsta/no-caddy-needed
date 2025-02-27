import { ScrollView, Text, View } from 'react-native';
import ScreenWrapper from '../screen-wrapper';
import styles from '@/assets/stlyes';

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      <ScrollView>
        <View style={styles.viewContainer}>
          <Text style={[styles.subHeaderText, { marginBottom: 10 }]}>
            Golfers seeking smarter practice & setting better on course expectations
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
