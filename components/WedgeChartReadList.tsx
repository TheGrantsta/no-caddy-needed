import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import type { WedgeChartData } from '../service/DbService';
import { yardsToDisplayUnit, DistanceUnit } from '../service/UnitsService';

type Props = {
    data: WedgeChartData;
    units: DistanceUnit;
};

const WedgeChartReadList = ({ data, units }: Props) => {
    const styles = useStyles();
    const s = styles.wedgeChartReadList;

    const formatDistance = (yards: number) => {
        if (!yards) return '-';
        return String(yardsToDisplayUnit(yards, units));
    };

    return (
        <View style={s.card}>
            <View style={s.headerRow}>
                <Text style={[s.headerText, s.clubCell]}>Club</Text>
                {data.distanceNames.map(name => (
                    <Text key={name} numberOfLines={1} style={[s.headerText, s.valueCell]}>{name}</Text>
                ))}
            </View>
            {data.clubs.map((club, index) => (
                <View
                    key={`${club.club}-${index}`}
                    testID={`wedge-read-row-${index}`}
                    style={[s.row, index > 0 && s.rowDivider]}
                >
                    <Text style={[s.clubText, s.clubCell]}>{club.club}</Text>
                    {club.distances.map((d, i) => (
                        <Text key={`${d.name}-${i}`} style={[s.valueText, s.valueCell]}>
                            {formatDistance(d.distance)}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
};

export default WedgeChartReadList;
