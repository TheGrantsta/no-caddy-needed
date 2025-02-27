import { Platform, ScrollView, Text, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '@/assets/stlyes';

export default function HomeScreen() {
  return (
    <ScrollView>
      <View style={styles.viewContainer}>
        <Text style={[styles.subHeaderText, { marginBottom: 10 }]}>
          Golfers seeking smarter practice & setting better on course expectations
        </Text>
      </View>
    </ScrollView>
  );
}
