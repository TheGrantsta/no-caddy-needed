import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    title: string;
    onEnd: () => void;
    hole?: { current: number; total: number };
};

// Green app bar for the challenge screens: End button, title, and optional hole progress
const SimulationAppBar = ({ title, onEnd, hole }: Props) => {
    const styles = useStyles();
    const s = styles.simulation;
    const { top: topInset } = useSafeAreaInsets();

    return (
        <View style={[s.header, { paddingTop: topInset + 12 }]}>
            <View style={s.topRow}>
                <TouchableOpacity testID="simulation-end-button" accessibilityRole="button" onPress={onEnd} style={s.endButton}>
                    <Text style={s.endButtonText}>End</Text>
                </TouchableOpacity>
                <Text numberOfLines={1} style={s.title}>{title}</Text>
                <View style={s.titleSpacer} />
            </View>
            {hole && (
                <>
                    <View style={s.holeRow}>
                        <Text testID="simulation-hole" style={s.holeText}>{`Hole ${hole.current}`}</Text>
                        <Text style={s.ofText}>{`of ${hole.total}`}</Text>
                    </View>
                    <View style={s.progressTrack}>
                        <View
                            testID="simulation-progress-fill"
                            style={[s.progressFill, { width: `${(hole.current / hole.total) * 100}%` }]}
                        />
                    </View>
                </>
            )}
        </View>
    );
};

export default SimulationAppBar;
