import { Text, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { WedgeChartData } from '@/service/DbService';

type Props = {
    data: WedgeChartData;
    suggestedClubs: { club: string; name: string; distance: number }[];
};

/**
 * Renders a mini wedge chart grid with suggested club/swing-type combinations highlighted.
 */
const WedgeChartGrid = ({ data, suggestedClubs }: Props) => {
    const colours = useThemeColours();
    const styles = useStyles();

    if (!data.clubs || data.clubs.length === 0) return null;

    const suggestedSet = new Set(suggestedClubs.map(c => `${c.club}-${c.name}`));

    return (
        <View style={styles.wedgeChartGrid.container}>
            {/* Header row with club numbers */}
            <View style={styles.wedgeChartGrid.row}>
                <Text style={[styles.wedgeChartGrid.cell, styles.wedgeChartGrid.headerCell]}>
                    Club
                </Text>
                {data.clubs.map(club => (
                    <Text
                        key={club.club}
                        style={[styles.wedgeChartGrid.cell, styles.wedgeChartGrid.headerCell]}
                    >
                        {club.club}
                    </Text>
                ))}
            </View>

            {/* Data rows for each swing type */}
            {data.distanceNames.map((distanceName, rowIdx) => (
                <View key={`row-${rowIdx}`} style={styles.wedgeChartGrid.row}>
                    <Text style={[styles.wedgeChartGrid.cell, styles.wedgeChartGrid.labelCell]}>
                        {distanceName}
                    </Text>
                    {data.clubs.map(club => {
                        const distance = club.distances[rowIdx];
                        const isHighlighted = suggestedSet.has(`${club.club}-${distanceName}`);
                        return (
                            <View
                                key={`${club.club}-${rowIdx}`}
                                style={[
                                    styles.wedgeChartGrid.cell,
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
                                    {distance?.distance ?? '—'}
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
