import { ScrollView, Text, View } from 'react-native';
import ScreenWrapper from '../screen-wrapper';
import styles from '@/assets/stlyes';
import Chrevons from '@/components/Chevrons';

export default function HomeScreen() {
  const points = ['Control low point', 'Improve centre strike', 'Enhance clubface control'];

  return (
    <ScreenWrapper>
      <ScrollView>
        <View style={styles.viewContainer}>
          <Text style={[styles.subHeaderText, { marginBottom: 10 }]}>
            Golfers seeking smarter practice & setting better on course expectations
          </Text>

          <Chrevons heading='Get the ball in the hole in the fewest shots' points={points} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
