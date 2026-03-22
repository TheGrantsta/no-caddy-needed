import React, { useMemo } from 'react';
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

    const maxTotal = useMemo(() => Math.max(...stats.map(st => st.total)), [stats]);

    if (stats.length === 0) {
        return null;
    }

    const getBarColor = (successRate: number) => {
        if (successRate >= 70) return colours.black;
        if (successRate >= 40) return colours.primary;
        return colours.red;
    };

    const truncateName = (name: string, maxLength: number = 15) => {
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

        </View>
    );
}
