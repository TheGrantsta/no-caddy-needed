import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColours } from '@/context/ThemeContext';
import { DeadlySinsRound } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';

type CategoryTotal = {
    label: string;
    key: keyof DeadlySinsRound;
    count: number;
};

type Props = {
    rounds: DeadlySinsRound[];
};

const CATEGORY_LABELS: { key: keyof DeadlySinsRound; label: string }[] = [
    { key: 'TroubleOffTee', label: 'Trouble off tee' },
    { key: 'Penalties', label: 'Penalties' },
    { key: 'ThreePutts', label: '3-putts' },
    { key: 'BogeysInside9Iron', label: 'Bogeys inside 9-iron' },
    { key: 'DoubleChips', label: 'Double chips' },
    { key: 'DoubleBogeys', label: 'Double bogeys' },
    { key: 'BogeysPar5', label: 'Bogeys on par 5' },
];

export default function DeadlySinsChart({ rounds }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.deadlySinsChart;
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    if (rounds.length === 0 || rounds.every(r => r.Total === 0)) {
        return null;
    }

    const categories: CategoryTotal[] = CATEGORY_LABELS.map(({ key, label }) => ({
        label,
        key,
        count: rounds.reduce((sum, round) => sum + (round[key] as number), 0),
    }));

    categories.sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...categories.map(c => c.count));

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
                <Text style={styles.subHeaderText}>7 Deadly Sins</Text>
                <Text style={s.chevron}>{isOpen ? '▾' : '▴'}</Text>
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
                                params: { sinKey: category.key, label: category.label },
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
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </View>
    );
}
