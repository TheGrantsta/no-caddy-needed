import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { DrillStats } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    stats: DrillStats[];
};

export default function DrillStatsChart({ stats }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.drillStatsChart;

    if (stats.length === 0) {
        return null;
    }

    const maxTotal = Math.max(...stats.map(st => st.total));

    const getBarColor = (successRate: number) => {
        if (successRate >= 70) return colours.green;
        if (successRate >= 40) return colours.primary;
        return colours.red;
    };

    const truncateName = (name: string, maxLength: number = 20) => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 3) + '...';
    };

    return (
        <View style={s.container}>
            <Text style={s.title}>Success Rate by Drill</Text>

            {stats.slice(0, 8).map((stat, index) => (
                <View key={index} style={s.barContainer}>
                    <View style={s.labelContainer}>
                        <Text style={s.label} numberOfLines={1}>
                            {truncateName(stat.name)}
                        </Text>
                    </View>

                    <View style={s.barWrapper}>
                        <View
                            style={[
                                s.bar,
                                {
                                    width: `${(stat.total / maxTotal) * 100}%`,
                                    backgroundColor: getBarColor(stat.successRate)
                                }
                            ]}
                        />
                        <View
                            style={[
                                s.barBackground,
                                { width: `${100 - (stat.total / maxTotal) * 100}%` }
                            ]}
                        />
                    </View>

                    <View style={s.statsContainer}>
                        <Text style={s.statsText}>
                            {stat.successRate}%
                        </Text>
                        <Text style={s.countText}>
                            ({stat.met}/{stat.total})
                        </Text>
                    </View>
                </View>
            ))}

            <View style={s.legend}>
                <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: colours.green }]} />
                    <Text style={s.legendText}>≥70%</Text>
                </View>
                <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: colours.primary }]} />
                    <Text style={s.legendText}>40-69%</Text>
                </View>
                <View style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: colours.errorText }]} />
                    <Text style={s.legendText}>&lt;40%</Text>
                </View>
            </View>
        </View>
    );
}
