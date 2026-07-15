import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { WedgeChartData } from '@/service/DbService';
import { yardsToDisplayUnit } from '@/service/UnitsService';

type Props = {
    data: WedgeChartData;
    suggestedClubs: { club: string; name: string; distance: number }[];
    unit?: 'yards' | 'metres';
};

/**
 * Renders a mini wedge chart grid with suggested club/swing-type combinations highlighted.
 * Layout: clubs across top (columns), swing types down side (rows).
 */
const WedgeChartGrid = ({ data, suggestedClubs, unit = 'yards' }: Props) => {
    const styles = useStyles();

    if (!data.clubs || data.clubs.length === 0) return null;

    const suggestedSet = new Set(suggestedClubs.map(c => `${c.club}-${c.name}`));

    return (
        <View style={[styles.wedgeChartGrid.container, { alignItems: 'flex-start' }]}>
            {/* Header row with distance names */}
            <View style={styles.wedgeChartGrid.headerRow}>
                <View style={styles.wedgeChartGrid.labelCell} />
                {data.distanceNames.map(distanceName => (
                    <View key={`header-${distanceName}`} style={styles.wedgeChartGrid.clubHeaderCell}>
                        <Text style={styles.wedgeChartGrid.clubHeaderText}>
                            {distanceName}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Data rows for each club number */}
            {data.clubs.map((club, clubIdx) => (
                <View key={`row-${club.club}`} style={styles.wedgeChartGrid.dataRow}>
                    <View style={styles.wedgeChartGrid.swingTypeCell}>
                        <Text style={styles.wedgeChartGrid.swingTypeText}>
                            {club.club}
                        </Text>
                    </View>
                    {data.distanceNames.map((distanceName) => {
                        const distance = club.distances.find(d => d.name === distanceName);
                        const isHighlighted = suggestedSet.has(`${club.club}-${distanceName}`);
                        return (
                            <View
                                key={`${club.club}-${distanceName}`}
                                style={[
                                    styles.wedgeChartGrid.dataCell,
                                    isHighlighted && styles.wedgeChartGrid.highlightedCell,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.wedgeChartGrid.dataText,
                                        isHighlighted && styles.wedgeChartGrid.highlightedText,
                                    ]}
                                >
                                    {distance ? yardsToDisplayUnit(distance.distance, unit) : '—'}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

export default WedgeChartGrid;
