import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColours } from '@/context/ThemeContext';
import { DeadlySinsRound } from '@/service/DbService';
import { sortDeadlySinsByFrequency } from '@/service/deadlySinCategories';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    rounds: DeadlySinsRound[];
    filter?: 'all' | 1 | 10;
};

export default function DeadlySinsChart({ rounds, filter = 'all' }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.deadlySinsChart;
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const categories = useMemo(() => sortDeadlySinsByFrequency(rounds), [rounds]);

    const maxCount = useMemo(() => Math.max(...categories.map(c => c.count)), [categories]);

    if (rounds.length === 0 || rounds.every(r => r.Total === 0)) {
        return null;
    }

    const getBarColor = (index: number) => {
        if (index === 0) return colours.red;
        if (index === 6) return colours.green;
        return colours.primary;
    };

    const getBarWidth = (count: number): string => {
        if (maxCount === 0) return '0%';
        return `${(count / maxCount) * 100}%`;
    };

    return (
        <View style={s.container}>
            <TouchableOpacity
                testID="7deadly-sins-chart-toggle"
                onPress={() => setIsOpen(prev => !prev)}
                style={s.toggleHeader}
            >
                <Text style={styles.subHeaderText}>Deadly Sins</Text>
                <Text testID="7deadly-sins-chart-toggle-icon" style={s.chevron}>{isOpen ? '−' : '+'}</Text>
            </TouchableOpacity>

            {isOpen && (
                <>
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            testID={`7deadly-sins-chart-bar-row-${index}`}
                            style={s.barContainer}
                            onPress={() => router.push({
                                pathname: '/play/deadly-sin-trend',
                                params: { sinKey: category.key, label: category.label, filter: String(filter) },
                            })}
                        >
                            <View style={s.labelContainer}>
                                <Text testID="7deadly-sins-chart-label" style={s.label} numberOfLines={1}>
                                    {category.label}
                                </Text>
                            </View>

                            <View style={s.barWrapper}>
                                <View
                                    testID={`7deadly-sins-chart-bar-${index}`}
                                    style={[
                                        s.bar,
                                        {
                                            width: getBarWidth(category.count),
                                            backgroundColor: getBarColor(index),
                                        }
                                    ]}
                                />
                                <View
                                    style={[
                                        s.barBackground,
                                        { width: `${maxCount === 0 ? 100 : 100 - (category.count / maxCount) * 100}%` }
                                    ]}
                                />
                            </View>

                            <View style={s.countContainer}>
                                <Text testID={`7deadly-sins-chart-count-${index}`} style={s.countText}>
                                    {category.count}
                                </Text>
                            </View>

                            <Text testID="7deadly-sins-chart-disclosure" style={s.disclosure}>
                                ›
                            </Text>
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </View>
    );
}
