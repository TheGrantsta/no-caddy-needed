import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    holeNumber: number;
    totalHoles: number;
    onPrevious: () => void;
    onNext: () => void;
    // Name of the step being counted, e.g. "Hole" or "Level"
    unitLabel?: string;
};

// Floating bar at the bottom of a challenge with previous/next hole controls
const SimulationHoleBar = ({ holeNumber, totalHoles, onPrevious, onNext, unitLabel = 'Hole' }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.simulation;
    const { bottom: bottomInset } = useSafeAreaInsets();
    const isLastHole = holeNumber === totalHoles;

    return (
        <View style={[s.bottomBar, { bottom: 16 + bottomInset }]}>
            {holeNumber > 1 ? (
                <TouchableOpacity testID="previous-hole-button" accessibilityRole="button" onPress={onPrevious} style={s.prevButton}>
                    <MaterialIcons name="chevron-left" size={18} color={colours.primary} />
                    <Text style={s.prevText}>{`${unitLabel} ${holeNumber - 1}`}</Text>
                </TouchableOpacity>
            ) : <View />}
            <TouchableOpacity testID="next-hole-button" accessibilityRole="button" onPress={onNext} style={s.nextButton}>
                <Text style={s.nextText}>{isLastHole ? 'Finish' : `${unitLabel} ${holeNumber + 1}`}</Text>
                <MaterialIcons name={isLastHole ? 'sports-score' : 'chevron-right'} size={16} color={colours.white} />
            </TouchableOpacity>
        </View>
    );
};

export default SimulationHoleBar;
