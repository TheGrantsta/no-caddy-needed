import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';

interface Props {
    onStartRound?: () => void;
}

export default function StatsEmptyState({ onStartRound }: Props) {
    const styles = useStyles();

    return (
        <View style={{ alignItems: 'center', paddingHorizontal: 16, marginTop: 12 }}>
            <Text style={[styles.normalText, { textAlign: 'center' }]}>Complete a round to see stats.</Text>
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 8 }]}>
                Rounds saved in score-only mode do not count toward these stats.
            </Text>
            {onStartRound && (
                <TouchableOpacity onPress={onStartRound} style={styles.ctaButton}>
                    <Text style={styles.ctaButtonText}>Start a round</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
