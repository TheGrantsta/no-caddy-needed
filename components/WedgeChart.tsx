import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import type { WedgeChartData } from '../service/DbService';
import { yardsToDisplayUnit, displayUnitToYards } from '../service/UnitsService';

type Props = {
    data: WedgeChartData;
    onSave?: (data: WedgeChartData) => void;
    units?: 'yards' | 'metres';
};

type EditableRow = {
    club: string;
    distances: string[];
};

const MAX_CLUBS = 4;
const MAX_DISTANCES = 6;

const WedgeChart = ({ data, onSave, units = 'yards' }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.wedgeChart;
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

    return (
        <View style={s.container}>

            <View style={s.headerRow}>
                {rows.length > 0 && (
                    <View style={[s.headerCell, s.labelCell]}>
                        <Text style={s.input}>X</Text>
                    </View>
                )}
                {rows.map((row, clubIndex) => (
                    <TextInput
                        key={`club-${clubIndex}`}
                        testID={`wedge-club-input-${clubIndex}`}
                        style={[s.headerInput, s.columnCell]}
                        value={row.club}
                        onChangeText={(v) => handleUpdateClub(clubIndex, v)}
                        placeholder="Club"
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                ))}
            </View>

            {/* Data rows for each distance */}
            {distanceNames.map((distanceName, distIndex) => (
                <View key={distIndex} style={s.row}>
                    <TextInput
                        testID={`distance-name-input-${distIndex}`}
                        style={[s.input, s.labelCell, distIndex === distanceNames.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colours.primary + '33' }]}
                        value={distanceName}
                        onChangeText={(v) => handleUpdateDistanceName(distIndex, v)}
                        placeholder="Name"
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                    {rows.map((row, clubIndex) => (
                        <TextInput
                            key={`${clubIndex}-${distIndex}`}
                            testID={`wedge-distance-input-${clubIndex}-${distIndex}`}
                            style={[s.input, s.columnCell, distIndex === distanceNames.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colours.primary + '33' }]}
                            value={row.distances[distIndex]}
                            onChangeText={(v) => handleUpdateDistance(clubIndex, distIndex, v)}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colours.backgroundAlternate}
                        />
                    ))}
                </View>
            ))}

            <View style={s.buttonRow}>
                {rows.length < MAX_CLUBS && (
                    <TouchableOpacity
                        testID="add-wedge-club-button"
                        onPress={handleAddClub}
                        style={s.addButton}
                    >
                        <Text style={s.addButtonText}>+ Add club</Text>
                    </TouchableOpacity>
                )}
                {rows.length > 0 && distanceNames.length < MAX_DISTANCES && (
                    <TouchableOpacity
                        testID="add-wedge-distance-button"
                        onPress={handleAddDistance}
                        style={s.addButton}
                    >
                        <Text style={s.addButtonText}>+ Add distance</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                testID="save-wedge-chart-button"
                onPress={handleSave}
                style={s.saveButton}
            >
                <Text style={s.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default WedgeChart;
