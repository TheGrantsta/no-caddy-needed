import { Text, View, ScrollView } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { WedgeChartData } from '@/service/DbService';

type Props = {
    data: WedgeChartData;
    suggestedClubs: { club: string; name: string; distance: number }[];
};

/**
 * Renders a mini wedge chart grid with suggested club/swing-type combinations highlighted.
 * Layout: clubs across top (columns), swing types down side (rows).
 */
const WedgeChartGrid = ({ data, suggestedClubs }: Props) => {
    const colours = useThemeColours();
    const styles = useStyles();

    if (!data.clubs || data.clubs.length === 0) return null;

    const suggestedSet = new Set(suggestedClubs.map(c => `${c.club}-${c.name}`));

    return (
        <ScrollView
            horizontal
            style={styles.wedgeChartGrid.scrollContainer}
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.wedgeChartGrid.container}>
                {/* Header row with swing types */}
                <View style={styles.wedgeChartGrid.headerRow}>
                    <View style={styles.wedgeChartGrid.labelCell}>
                        <Text style={styles.wedgeChartGrid.labelText}>Club</Text>
                    </View>
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
                        {data.distanceNames.map((distanceName, distIdx) => {
                            const distance = club.distances[distIdx];
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
                                        {distance?.distance ?? '—'}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default WedgeChartGrid;
