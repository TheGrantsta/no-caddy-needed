import { ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import RoundScorecard from '../../components/RoundScorecard';
import { getRoundScorecardService } from '../../service/DbService';
import styles from '../../assets/stlyes';

export default function ScorecardScreen() {
    const { roundId } = useLocalSearchParams<{ roundId: string }>();
    const scorecard = getRoundScorecardService(Number(roundId));

    if (!scorecard) {
        return (
            <GestureHandlerRootView style={styles.flexOne}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Round not found</Text>
                </View>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Scorecard</Text>
                </View>
                <RoundScorecard
                    totalScore={scorecard.round.TotalScore}
                    coursePar={scorecard.round.CoursePar}
                    holes={scorecard.holes}
                />
            </ScrollView>
        </GestureHandlerRootView>
    );
}
