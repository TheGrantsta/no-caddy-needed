import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { yardsToDisplayUnit, distanceUnitLabel, DistanceUnit } from '../service/UnitsService';

type ClubDistance = {
    Id: number;
    Club: string;
    CarryDistance: number;
    TotalDistance: number;
    SortOrder: number;
};

type Props = {
    distances: ClubDistance[];
    metric: 'carry' | 'total';
    units: DistanceUnit;
};

const ClubDistanceReadList = ({ distances, metric, units }: Props) => {
    const styles = useStyles();
    const s = styles.clubDistanceReadList;
    const metricLabel = metric === 'carry' ? 'Carry' : 'Total';

    const formatDistance = (yards: number) => {
        if (!yards) return '-';
        return `${yardsToDisplayUnit(yards, units)} ${distanceUnitLabel(units)}`;
    };

    return (
        <View style={s.card}>
            <View style={s.headerRow}>
                <Text style={s.headerText}>Club</Text>
                <Text testID="read-metric-header" style={s.headerText}>{metricLabel}</Text>
            </View>
            {distances.map((club, index) => (
                <View
                    key={club.Id}
                    testID={`read-club-row-${index}`}
                    style={[s.row, index > 0 && s.rowDivider]}
                >
                    <Text style={s.clubText}>{club.Club}</Text>
                    <Text style={s.distanceText}>
                        {formatDistance(metric === 'carry' ? club.CarryDistance : club.TotalDistance)}
                    </Text>
                </View>
            ))}
        </View>
    );
};

export default ClubDistanceReadList;
