import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import { DeadlySinsRound } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';

type CategoryTotal = {
    label: string;
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
    const [isOpen, setIsOpen] = useState(true);

    const localStyles = useMemo(() => StyleSheet.create({
        container: {
            padding: 10,
            paddingBottom: 0,
        },
        title: {
            color: colours.yellow,
            fontSize: fontSizes.subHeader,
            textAlign: 'center',
        },
        barContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        labelContainer: {
            width: 120,
            paddingRight: 5,
        },
        label: {
            color: colours.white,
            fontSize: fontSizes.smallestText,
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
        countContainer: {
            width: 40,
            alignItems: 'flex-end',
        },
        countText: {
            color: colours.yellow,
            fontSize: fontSizes.smallText,
            fontWeight: 'bold',
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
            fontSize: fontSizes.smallestText,
        },
        toggleHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            borderBottomWidth: 0.5,
            borderColor: colours.yellow,
        },
        chevron: {
            color: colours.yellow,
            fontSize: fontSizes.header,
        },
    }), [colours]);

    if (rounds.length === 0 || rounds.every(r => r.Total === 0)) {
        return null;
    }

    const categories: CategoryTotal[] = CATEGORY_LABELS.map(({ key, label }) => ({
        label,
        count: rounds.reduce((sum, round) => sum + (round[key] as number), 0),
    }));

    categories.sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...categories.map(c => c.count));

    const getBarColor = (index: number) => {
        if (index === 0) return colours.errorText;
        if (index === 6) return colours.green;
        return colours.yellow;
    };

    const getBarWidth = (count: number): string => {
        if (maxCount === 0) return '0%';
        return `${(count / maxCount) * 100}%`;
    };

    return (
        <View style={localStyles.container}>
            <TouchableOpacity
                testID="7deadly-sins-chart-toggle"
                onPress={() => setIsOpen(prev => !prev)}
                style={localStyles.toggleHeader}
            >
                <Text style={styles.subHeaderText}>7 Deadly Sins</Text>
                <Text style={localStyles.chevron}>{isOpen ? '▾' : '▴'}</Text>
            </TouchableOpacity>

            {isOpen && (
                <>
                    {categories.map((category, index) => (
                        <View key={index} style={localStyles.barContainer}>
                            <View style={localStyles.labelContainer}>
                                <Text testID="7deadly-sins-chart-label" style={localStyles.label} numberOfLines={1}>
                                    {category.label}
                                </Text>
                            </View>

                            <View style={localStyles.barWrapper}>
                                <View
                                    testID={`7deadly-sins-chart-bar-${index}`}
                                    style={[
                                        localStyles.bar,
                                        {
                                            width: getBarWidth(category.count),
                                            backgroundColor: getBarColor(index),
                                        }
                                    ]}
                                />
                                <View
                                    style={[
                                        localStyles.barBackground,
                                        { width: `${maxCount === 0 ? 100 : 100 - (category.count / maxCount) * 100}%` }
                                    ]}
                                />
                            </View>

                            <View style={localStyles.countContainer}>
                                <Text testID={`7deadly-sins-chart-count-${index}`} style={localStyles.countText}>
                                    {category.count}
                                </Text>
                            </View>
                        </View>
                    ))}

                    <View style={localStyles.legend}>
                        <View style={localStyles.legendItem}>
                            <View style={[localStyles.legendDot, { backgroundColor: colours.errorText }]} />
                            <Text style={localStyles.legendText}>Biggest problem</Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}
