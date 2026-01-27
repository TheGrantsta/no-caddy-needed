import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colours from '@/assets/colours';
import fontSizes from '@/assets/font-sizes';
import { DrillStats } from '@/service/DbService';

type Props = {
    stats: DrillStats[];
};

export default function DrillStatsChart({ stats }: Props) {
    if (stats.length === 0) {
        return null;
    }

    const maxTotal = Math.max(...stats.map(s => s.total));

    const getBarColor = (successRate: number) => {
        if (successRate >= 70) return colours.green;
        if (successRate >= 40) return colours.yellow;
        return colours.errorText;
    };

    const truncateName = (name: string, maxLength: number = 20) => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 3) + '...';
    };

    return (
        <View style={localStyles.container}>
            <Text style={localStyles.title}>Success Rate by Drill</Text>

            {stats.slice(0, 8).map((stat, index) => (
                <View key={index} style={localStyles.barContainer}>
                    <View style={localStyles.labelContainer}>
                        <Text style={localStyles.label} numberOfLines={1}>
                            {truncateName(stat.name)}
                        </Text>
                    </View>

                    <View style={localStyles.barWrapper}>
                        <View
                            style={[
                                localStyles.bar,
                                {
                                    width: `${(stat.total / maxTotal) * 100}%`,
                                    backgroundColor: getBarColor(stat.successRate)
                                }
                            ]}
                        />
                        <View
                            style={[
                                localStyles.barBackground,
                                { width: `${100 - (stat.total / maxTotal) * 100}%` }
                            ]}
                        />
                    </View>

                    <View style={localStyles.statsContainer}>
                        <Text style={localStyles.statsText}>
                            {stat.successRate}%
                        </Text>
                        <Text style={localStyles.countText}>
                            ({stat.met}/{stat.total})
                        </Text>
                    </View>
                </View>
            ))}

            <View style={localStyles.legend}>
                <View style={localStyles.legendItem}>
                    <View style={[localStyles.legendDot, { backgroundColor: colours.green }]} />
                    <Text style={localStyles.legendText}>≥70%</Text>
                </View>
                <View style={localStyles.legendItem}>
                    <View style={[localStyles.legendDot, { backgroundColor: colours.yellow }]} />
                    <Text style={localStyles.legendText}>40-69%</Text>
                </View>
                <View style={localStyles.legendItem}>
                    <View style={[localStyles.legendDot, { backgroundColor: colours.errorText }]} />
                    <Text style={localStyles.legendText}>&lt;40%</Text>
                </View>
            </View>
        </View>
    );
}

const localStyles = StyleSheet.create({
    container: {
        padding: 10,
        marginBottom: 10,
    },
    title: {
        color: colours.yellow,
        fontSize: fontSizes.subHeader,
        marginBottom: 15,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelContainer: {
        width: 100,
        paddingRight: 5,
    },
    label: {
        color: colours.white,
        fontSize: fontSizes.small,
    },
    barWrapper: {
        flex: 1,
        flexDirection: 'row',
        height: 20,
        borderRadius: 4,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    barBackground: {
        height: '100%',
        backgroundColor: colours.backgroundLight,
    },
    statsContainer: {
        width: 70,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    statsText: {
        color: colours.yellow,
        fontSize: fontSizes.small,
        fontWeight: 'bold',
        marginRight: 2,
    },
    countText: {
        color: colours.white,
        fontSize: fontSizes.smallest,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colours.border,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        color: colours.white,
        fontSize: fontSizes.smallest,
    },
});
