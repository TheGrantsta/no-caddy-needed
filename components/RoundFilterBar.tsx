import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { RoundFilter, serializeRoundFilter } from '../utils/roundFilter';

interface Props {
    value: RoundFilter;
    onChange: (filter: RoundFilter) => void;
    years: number[];
}

const COUNT_OPTIONS: { filter: RoundFilter; label: string }[] = [
    { filter: 1, label: 'Last 1' },
    { filter: 10, label: 'Last 10' },
    { filter: 'all', label: 'All' },
];

// One compact row: count segments take the remaining width, the year menu sits beside them.
export default function RoundFilterBar({ value, onChange, years }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.playScreen;
    const [menuOpen, setMenuOpen] = useState(false);

    const selectedKey = serializeRoundFilter(value);
    const selectedYear = typeof value === 'object' ? value.year : null;

    const pickFilter = (filter: RoundFilter) => {
        setMenuOpen(false);
        onChange(filter);
    };

    const renderSegment = (filter: RoundFilter, label: string, isLast: boolean) => {
        const key = serializeRoundFilter(filter);
        const selected = key === selectedKey;
        return (
            <TouchableOpacity
                key={key}
                testID={`filter-button-${key}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => pickFilter(filter)}
                style={[
                    localStyles.segment,
                    { borderRightWidth: isLast ? 0 : 1, borderRightColor: colours.primary },
                    selected && { backgroundColor: colours.primary },
                ]}
            >
                <Text numberOfLines={1} style={[s.filterButtonText, selected && s.filterButtonTextSelected]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderYearChip = (year: number) => {
        const filter: RoundFilter = { year };
        const key = serializeRoundFilter(filter);
        const selected = key === selectedKey;
        return (
            <TouchableOpacity
                key={key}
                testID={`filter-button-${key}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => pickFilter(filter)}
                style={[s.filterButton, selected && s.filterButtonSelected]}
            >
                <Text numberOfLines={1} style={[s.filterButtonText, selected && s.filterButtonTextSelected]}>
                    {String(year)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={localStyles.wrapper}>
            <View testID="filter-row" style={[s.filterContainer, localStyles.row]}>
                <View testID="count-segments" style={[localStyles.segmentedControl, { borderColor: colours.primary }]}>
                    {COUNT_OPTIONS.map(({ filter, label }, i) =>
                        renderSegment(filter, label, i === COUNT_OPTIONS.length - 1)
                    )}
                </View>

                {years.length > 0 && (
                    <TouchableOpacity
                        testID="year-menu-button"
                        accessibilityRole="button"
                        accessibilityState={{ selected: selectedYear !== null, expanded: menuOpen }}
                        onPress={() => setMenuOpen(open => !open)}
                        style={[s.filterButton, selectedYear !== null && s.filterButtonSelected]}
                    >
                        <Text numberOfLines={1} style={[s.filterButtonText, selectedYear !== null && s.filterButtonTextSelected]}>
                            {`${selectedYear !== null ? String(selectedYear) : 'Year'} ▾`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {menuOpen && years.length > 0 && (
                <View testID="year-menu-list" style={[s.filterContainer, localStyles.yearList]}>
                    {years.map(renderYearChip)}
                </View>
            )}
        </View>
    );
}

const localStyles = {
    wrapper: { paddingVertical: 8 },
    row: { justifyContent: 'flex-start' as const, alignItems: 'center' as const, paddingHorizontal: 15, paddingVertical: 0, gap: 8 },
    segmentedControl: {
        flex: 1,
        flexDirection: 'row' as const,
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden' as const,
    },
    segment: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 6,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    yearList: {
        flexWrap: 'wrap' as const,
        justifyContent: 'flex-start' as const,
        paddingTop: 8,
        paddingHorizontal: 15,
    },
};
