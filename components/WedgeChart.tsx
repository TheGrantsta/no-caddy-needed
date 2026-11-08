import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import type { WedgeChartData } from '../service/DbService';
import { yardsToDisplayUnit, displayUnitToYards } from '../service/UnitsService';

type Props = {
    data: WedgeChartData;
    onSave?: (data: WedgeChartData) => void;
    units?: 'yards' | 'metres';
};

export type WedgeChartHandle = {
    save: () => void;
};

type EditableRow = {
    club: string;
    distances: string[];
};

const MAX_CLUBS = 4;
const MAX_DISTANCES = 6;

const WedgeChart = forwardRef<WedgeChartHandle, Props>(({ data, onSave, units = 'yards' }, ref) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.wedgeEdit;
    const [distanceNames, setDistanceNames] = useState<string[]>(
        data.distanceNames.length > 0 ? [...data.distanceNames] : []
    );
    const [rows, setRows] = useState<EditableRow[]>(
        data.clubs.map(c => ({
            club: c.club,
            distances: c.distances.map(d => String(yardsToDisplayUnit(d.distance, units))),
        }))
    );

    const handleUpdateClub = (index: number, value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], club: value };
        setRows(newRows);
    };

    const handleUpdateDistance = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = [...rows];
        const newDistances = [...newRows[rowIndex].distances];
        newDistances[colIndex] = value;
        newRows[rowIndex] = { ...newRows[rowIndex], distances: newDistances };
        setRows(newRows);
    };

    const handleUpdateDistanceName = (index: number, value: string) => {
        const newNames = [...distanceNames];
        newNames[index] = value;
        setDistanceNames(newNames);
    };

    const handleRemoveClub = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleRemoveDistance = (index: number) => {
        setDistanceNames(distanceNames.filter((_, i) => i !== index));
        setRows(rows.map(r => ({ ...r, distances: r.distances.filter((_, i) => i !== index) })));
    };

    const handleAddClub = () => {
        if (rows.length >= MAX_CLUBS) return;
        setRows([...rows, { club: '', distances: distanceNames.map(() => '') }]);
    };

    const handleAddDistance = () => {
        if (distanceNames.length >= MAX_DISTANCES) return;
        setDistanceNames([...distanceNames, '']);
        setRows(rows.map(r => ({ ...r, distances: [...r.distances, ''] })));
    };

    const handleSave = () => {
        if (!onSave) return;
        const validRows = rows.filter(r => r.club.trim());
        const validDistanceNames = distanceNames.filter(n => n.trim());

        const chartData: WedgeChartData = {
            distanceNames: validDistanceNames,
            clubs: validRows.map(r => ({
                club: r.club.trim(),
                distances: validDistanceNames.map((name, i) => ({
                    name,
                    distance: displayUnitToYards(parseInt(r.distances[i]) || 0, units),
                })),
            })),
        };
        onSave(chartData);
    };

    useImperativeHandle(ref, () => ({ save: handleSave }));

    return (
        <View style={s.container}>
            <View testID="wedge-edit-card" style={s.card}>
                <View style={s.headerRow}>
                    <Text style={[s.headerText, s.clubCell]}>Wedge</Text>
                    {distanceNames.map((name, j) => (
                        <Text key={`header-${j}`} numberOfLines={1} style={[s.headerText, s.valueCell]}>
                            {name || `Column ${j + 1}`}
                        </Text>
                    ))}
                </View>

                {rows.map((row, clubIndex) => (
                    <React.Fragment key={`club-${clubIndex}`}>
                        {clubIndex > 0 && <View style={s.rowDivider} />}
                        <View testID={`wedge-edit-row-${clubIndex}`} style={s.row}>
                            <TouchableOpacity
                                testID={`wedge-remove-club-${clubIndex}`}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${row.club || 'wedge'}`}
                                onPress={() => handleRemoveClub(clubIndex)}
                                style={s.removeButton}
                            >
                                <MaterialIcons name="remove-circle" size={24} color={colours.red} />
                            </TouchableOpacity>
                            <TextInput
                                testID={`wedge-club-input-${clubIndex}`}
                                style={[s.clubInput, s.clubCell]}
                                value={row.club}
                                onChangeText={(v) => handleUpdateClub(clubIndex, v)}
                                placeholder="Wedge"
                                placeholderTextColor={colours.tertiary}
                            />
                            {row.distances.map((value, distIndex) => (
                                <TextInput
                                    key={`${clubIndex}-${distIndex}`}
                                    testID={`wedge-distance-input-${clubIndex}-${distIndex}`}
                                    style={[s.valueInput, s.valueCell]}
                                    value={value}
                                    onChangeText={(v) => handleUpdateDistance(clubIndex, distIndex, v)}
                                    keyboardType="number-pad"
                                    placeholder="0"
                                    placeholderTextColor={colours.tertiary}
                                />
                            ))}
                        </View>
                    </React.Fragment>
                ))}

                {rows.length < MAX_CLUBS && (
                    <>
                        {rows.length > 0 && <View style={s.rowDivider} />}
                        <TouchableOpacity testID="add-wedge-club-button" onPress={handleAddClub} style={s.addRow}>
                            <MaterialIcons name="add-circle" size={24} color={colours.green} />
                            <Text style={s.addRowText}>Add wedge</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <Text style={s.sectionLabel}>Swing lengths</Text>
            <View testID="wedge-swing-card" style={s.card}>
                {distanceNames.map((name, distIndex) => (
                    <React.Fragment key={`distance-${distIndex}`}>
                        {distIndex > 0 && <View style={s.rowDivider} />}
                        <View testID={`swing-row-${distIndex}`} style={s.row}>
                            <TouchableOpacity
                                testID={`wedge-remove-distance-${distIndex}`}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${name || `column ${distIndex + 1}`}`}
                                onPress={() => handleRemoveDistance(distIndex)}
                                style={s.removeButton}
                            >
                                <MaterialIcons name="remove-circle" size={24} color={colours.red} />
                            </TouchableOpacity>
                            <Text style={s.swingLabel}>{`Column ${distIndex + 1}`}</Text>
                            <TextInput
                                testID={`distance-name-input-${distIndex}`}
                                style={s.swingInput}
                                value={name}
                                onChangeText={(v) => handleUpdateDistanceName(distIndex, v)}
                                placeholder="Name"
                                placeholderTextColor={colours.tertiary}
                            />
                        </View>
                    </React.Fragment>
                ))}
                {distanceNames.length < MAX_DISTANCES && (
                    <>
                        {distanceNames.length > 0 && <View style={s.rowDivider} />}
                        <TouchableOpacity testID="add-wedge-distance-button" onPress={handleAddDistance} style={s.addRow}>
                            <MaterialIcons name="add-circle" size={24} color={colours.green} />
                            <Text style={s.addRowText}>Add swing length</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
});

WedgeChart.displayName = 'WedgeChart';

export default WedgeChart;
