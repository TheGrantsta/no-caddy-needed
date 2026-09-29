import React from 'react';
import { Animated, Text, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { getPuttingMakeRatesService, formatPuttCount } from '../service/DbService';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    filteredRoundIds?: Set<number>;
}

const PUTTING_PRO_RATES: Record<number, string> = {
    1: '100%*', 2: '99%*', 3: '99%', 4: '91%', 5: '81%', 6: '70%', 7: '61%', 8: '53%', 9: '46%', 10: '41%',
    11: '37%*', 12: '33%*', 13: '31%*', 14: '28%*', 15: '25%*', 16: '23%*', 17: '21%*', 18: '19%*', 19: '18%*', 20: '16%*',
    25: '10%*', 30: '7%*', 35: '5%*', 40: '3%*', 45: '2%*', 50: '1%*',
};

export default function PuttingStatsSection({
    fadeAnim,
    slideAnim,
    filteredRoundIds,
}: Props) {
    const styles = useStyles();

    const getPersonalPuttingStats = (roundIds?: Set<number>): [string, string][] => {
        const rates = getPuttingMakeRatesService(roundIds);
        return rates.map((row) => {
            const puttsSegment = row.putts > 0 ? ` of ${formatPuttCount(row.putts)}` : '';
            return [
                String(row.distance),
                `${row.makeRate}${puttsSegment} (${PUTTING_PRO_RATES[row.distance] || '-'})`,
            ];
        });
    };

    const hasPersonalPuttingData = (roundIds?: Set<number>): boolean => {
        const rates = getPuttingMakeRatesService(roundIds);
        return rates.some((row) => row.makeRate !== '-');
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {hasPersonalPuttingData(filteredRoundIds) ? (
                <>
                    <View style={styles.clubDistanceList.container}>
                        <View style={styles.clubDistanceList.headerRow}>
                            <View style={[styles.clubDistanceList.headerCell, styles.clubDistanceList.clubCell]}>
                                <Text style={styles.clubDistanceList.headerCell}>Feet</Text>
                            </View>
                            <View style={[styles.clubDistanceList.headerCell, styles.clubDistanceList.distanceCell]}>
                                <Text style={styles.clubDistanceList.headerCell}>Make rate</Text>
                            </View>
                        </View>
                        {getPersonalPuttingStats(filteredRoundIds).map(([distance, rate], index, rows) => (
                            <View key={distance} style={[styles.clubDistanceList.row, index === rows.length - 1 && { borderBottomWidth: 0.5 }]}>
                                <Text style={[styles.clubDistanceList.cell, styles.clubDistanceList.clubCell, { textAlign: 'center', }]}>{distance}</Text>
                                <Text style={[styles.clubDistanceList.cell, styles.clubDistanceList.distanceCell]}>{rate}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.normalText, styles.marginTop, { alignSelf: 'center' }]}>
                        Your personal putting make rates
                    </Text>

                    <Text style={[styles.smallestText, styles.marginBottom, { paddingHorizontal: 16, marginTop: 12 }]}>
                        * Estimated or extrapolated from PGA tour data
                    </Text>
                </>
            ) : (
                <>
                    <View style={styles.divider} />

                    <Text style={[styles.normalText, { paddingHorizontal: 16, marginTop: 12 }]}>
                        No putting data for selected rounds
                    </Text>
                </>
            )}
        </Animated.View>
    );
}
