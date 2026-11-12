import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/hooks/useStyles';
import { NextStepButton, PreviousStepButton } from './StepButtons';

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
    const s = styles.simulation;
    const { bottom: bottomInset } = useSafeAreaInsets();
    const isLastHole = holeNumber === totalHoles;

    return (
        <View style={[s.bottomBar, { bottom: 16 + bottomInset }]}>
            {holeNumber > 1 ? (
                <PreviousStepButton testID="previous-hole-button" label={`${unitLabel} ${holeNumber - 1}`} onPress={onPrevious} />
            ) : <View />}
            <NextStepButton
                testID="next-hole-button"
                label={isLastHole ? 'Finish' : `${unitLabel} ${holeNumber + 1}`}
                icon={isLastHole ? 'sports-score' : 'chevron-right'}
                onPress={onNext}
            />
        </View>
    );
};

export default SimulationHoleBar;
