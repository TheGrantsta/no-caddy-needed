import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    label: string;
    distance: number;
    unit: string;
};

// White card showing the distance for the current hole
const SimulationDistanceCard = ({ label, distance, unit }: Props) => {
    const styles = useStyles();
    const s = styles.simulation;

    return (
        <View testID="simulation-distance-card" style={s.card}>
            <Text style={s.cardLabel}>{label}</Text>
            <View style={s.distanceRow}>
                <Text testID="simulation-distance-value" style={s.distanceValue}>{String(distance)}</Text>
                <Text style={s.distanceUnit}>{unit}</Text>
            </View>
        </View>
    );
};

export default SimulationDistanceCard;
