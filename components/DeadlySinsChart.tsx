import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColours } from '@/context/ThemeContext';
import { DeadlySinsRound, getAllHoleSinDetailsService, HoleSinDetails } from '@/service/DbService';
import { sortDeadlySinsByFrequency, SIN_DETAIL_FIELDS } from '@/service/deadlySinCategories';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    rounds: DeadlySinsRound[];
    filter?: 'all' | 1 | 10;
};

export default function DeadlySinsChart({ rounds, filter = 'all' }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.deadlySinsChart;
    const router = useRouter();

    const categories = useMemo(() => sortDeadlySinsByFrequency(rounds), [rounds]);

    const maxCount = useMemo(() => Math.max(...categories.map(c => c.count)), [categories]);

    const roundIds = useMemo(() => new Set(rounds.map(r => r.RoundId)), [rounds]);
    const sinDetails = useMemo(() => getAllHoleSinDetailsService().filter(d => roundIds.has(d.RoundId)), [roundIds]);

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

    const getBreakdownForSin = (categoryKey: string) => {
        const detail = SIN_DETAIL_FIELDS[categoryKey as keyof typeof SIN_DETAIL_FIELDS];
        if (!detail) return [];

        const sinDetailRows = sinDetails.filter(d => d[detail.field] !== null && d[detail.field] !== undefined);
        return Array.from(
            sinDetailRows.reduce((counts, d) => {
                const value = d[detail.field] as string;
                counts.set(value, (counts.get(value) ?? 0) + 1);
                return counts;
            }, new Map<string, number>())
        ).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
    };

    const getMaxBreakdownCount = (categoryKey: string) => {
        const breakdown = getBreakdownForSin(categoryKey);
        return breakdown.length > 0 ? Math.max(...breakdown.map(b => b.count)) : 0;
    };

    return (
        <View style={s.container}>
            <View style={s.toggleHeader}>
                <Text style={styles.subHeaderText}>Deadly Sins</Text>
            </View>

            <ScrollView
                testID="7deadly-sins-chart-scrollview"
                scrollEnabled={true}
                nestedScrollEnabled={true}
            >
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

                    {/* Render breakdowns for sins with detail fields */}
                    {categories.map((category, categoryIndex) => {
                        const breakdown = getBreakdownForSin(category.key as string);
                        if (breakdown.length === 0) return null;

                        const detail = SIN_DETAIL_FIELDS[category.key as keyof typeof SIN_DETAIL_FIELDS];
                        const maxBreakdownCount = getMaxBreakdownCount(category.key as string);

                        return (
                            <View
                                key={`breakdown-${categoryIndex}`}
                                testID={`7deadly-sins-breakdown-section-${categoryIndex}`}
                                style={{ marginTop: 20, marginBottom: 16 }}
                            >
                                <Text
                                    testID={`7deadly-sins-breakdown-heading-${categoryIndex}`}
                                    style={[styles.normalText, { fontWeight: 'bold', marginBottom: 12, color: colours.text }]}
                                >
                                    {detail?.label}
                                </Text>
                                {breakdown.map((item, breakdownIndex) => (
                                    <View
                                        key={breakdownIndex}
                                        testID={`7deadly-sins-breakdown-row-${categoryIndex}-${breakdownIndex}`}
                                        style={[s.barContainer, { marginBottom: 8 }]}
                                    >
                                        <View style={s.labelContainer}>
                                            <Text
                                                testID={`7deadly-sins-breakdown-label-${categoryIndex}-${breakdownIndex}`}
                                                style={s.label}
                                                numberOfLines={1}
                                            >
                                                {item.label}
                                            </Text>
                                        </View>

                                        <View style={s.barWrapper}>
                                            <View
                                                testID={`7deadly-sins-breakdown-bar-${categoryIndex}-${breakdownIndex}`}
                                                style={[
                                                    s.bar,
                                                    {
                                                        width: maxBreakdownCount === 0 ? '0%' : `${(item.count / maxBreakdownCount) * 100}%`,
                                                        backgroundColor: colours.primary,
                                                    }
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    s.barBackground,
                                                    { width: `${maxBreakdownCount === 0 ? 100 : 100 - (item.count / maxBreakdownCount) * 100}%` }
                                                ]}
                                            />
                                        </View>

                                        <View style={s.countContainer}>
                                            <Text
                                                testID={`7deadly-sins-breakdown-count-${categoryIndex}-${breakdownIndex}`}
                                                style={s.countText}
                                            >
                                                {item.count}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        );
                    })}
            </ScrollView>
        </View>
    );
}
