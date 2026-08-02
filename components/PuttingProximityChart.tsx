import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { PuttingProximity } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    data: PuttingProximity[];
};

export default function PuttingProximityChart({ data }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.puttingProximityChart;

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <View style={s.container}>
            {data.map((row) => (
                <View key={row.distance} testID={`proximity-row-${row.distance}`} style={s.barContainer}>
                    <View style={s.labelContainer}>
                        <Text style={s.label}>{row.distance} ft</Text>
                    </View>

                    {row.shortPercent === '-' ? (
                        <View style={s.barWrapper}>
                            <View style={[s.bar, { backgroundColor: colours.backgroundLight, width: '100%' }]} />
                        </View>
                    ) : (
                        <View style={s.barWrapper}>
                            <View
                                style={[
                                    s.barShort,
                                    {
                                        width: row.shortPercent,
                                        backgroundColor: colours.red,
                                    },
                                ]}
                            />
                            <View
                                style={[
                                    s.barLong,
                                    {
                                        width: row.longPercent,
                                        backgroundColor: colours.primary,
                                    },
                                ]}
                            />
                        </View>
                    )}

                    <View style={s.percentContainer}>
                        <Text style={s.percentText}>
                            {row.shortPercent === '-' ? '-' : `${row.shortPercent} short / ${row.longPercent} long`}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}
