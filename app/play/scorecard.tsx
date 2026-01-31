import { ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import RoundScorecard from '../../components/RoundScorecard';
import MultiplayerScorecard from '../../components/MultiplayerScorecard';
import { getRoundScorecardService, getMultiplayerScorecardService } from '../../service/DbService';
import styles from '../../assets/stlyes';

export default function ScorecardScreen() {
    const { roundId } = useLocalSearchParams<{ roundId: string }>();
    const multiplayerScorecard = getMultiplayerScorecardService(Number(roundId));
    const scorecard = multiplayerScorecard ? null : getRoundScorecardService(Number(roundId));

    if (!multiplayerScorecard && !scorecard) {
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
                {multiplayerScorecard && (
                    <MultiplayerScorecard
                        round={multiplayerScorecard.round}
                        players={multiplayerScorecard.players}
                        holeScores={multiplayerScorecard.holeScores}
                    />
                )}
                {scorecard && (
                    <RoundScorecard
                        totalScore={scorecard.round.TotalScore}
                        coursePar={scorecard.round.CoursePar}
                        holes={scorecard.holes}
                    />
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}
