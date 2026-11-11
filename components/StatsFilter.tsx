import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { countRoundsByYear, filterLabel, getAvailableYears, RoundFilter, RoundWithYear, serializeRoundFilter } from '@/utils/roundFilter';

type Props = {
    value: RoundFilter;
    onChange: (filter: RoundFilter) => void;
    // Every round in the history, used for the year counts in the menu
    rounds: RoundWithYear[];
};

const ROUND_OPTIONS: { filter: RoundFilter; label: string }[] = [
    { filter: 1, label: 'Last round' },
    { filter: 10, label: 'Last 10 rounds' },
    { filter: 'all', label: 'All rounds' },
];

// Stats filter: a pill showing the current choice, a count of the rounds it covers, and a menu of
// round counts and calendar years listed inline under the pill. Choosing an option applies it and
// closes the menu; pressing the pill again also closes it.
export default function StatsFilter({ value, onChange, rounds }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.statsFilter;
    const [open, setOpen] = useState(false);

    const years = getAvailableYears(rounds);
    const yearCounts = countRoundsByYear(rounds);
    const selectedKey = serializeRoundFilter(value);

    const choose = (filter: RoundFilter) => {
        setOpen(false);
        onChange(filter);
    };

    // A tick for the option, or an empty space that keeps the labels lined up
    const tick = (key: string, selected: boolean) =>
        selected ? (
            <MaterialIcons testID={`stats-filter-check-${key}`} name="check" size={20} color={colours.primary} />
        ) : (
            <View style={s.checkPlaceholder} />
        );

    return (
        <View>
            <View style={s.row}>
                <TouchableOpacity
                    testID="stats-filter-button"
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    onPress={() => setOpen(current => !current)}
                    style={s.pill}
                >
                    <MaterialIcons name="filter-list" size={20} color={colours.primary} />
                    <Text style={s.pillText}>{filterLabel(value)}</Text>
                    <MaterialIcons name="expand-more" size={20} color={colours.primary} />
                </TouchableOpacity>
            </View>

            {open && (
                <View testID="stats-filter-menu" style={s.menu}>
                    <Text style={s.sectionLabel}>Rounds</Text>
                    {ROUND_OPTIONS.map(({ filter, label }) => {
                        const key = serializeRoundFilter(filter);
                        return (
                            <TouchableOpacity
                                key={key}
                                testID={`stats-filter-option-${key}`}
                                accessibilityRole="button"
                                onPress={() => choose(filter)}
                                style={s.option}
                            >
                                {tick(key, key === selectedKey)}
                                <Text style={s.optionText}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}

                    <Text style={[s.sectionLabel, s.sectionGap]}>Year</Text>
                    <TouchableOpacity
                        testID="stats-filter-option-all-years"
                        accessibilityRole="button"
                        onPress={() => choose('all')}
                        style={s.option}
                    >
                        {tick('all-years', value === 'all')}
                        <Text style={s.optionText}>All years</Text>
                        <Text style={s.optionCount}>{rounds.length}</Text>
                    </TouchableOpacity>
                    {years.map(year => {
                        const key = String(year);
                        return (
                            <TouchableOpacity
                                key={key}
                                testID={`stats-filter-option-${key}`}
                                accessibilityRole="button"
                                onPress={() => choose({ year })}
                                style={s.option}
                            >
                                {tick(key, key === selectedKey)}
                                <Text style={s.optionText}>{key}</Text>
                                <Text style={s.optionCount}>{yearCounts[year]}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
}
