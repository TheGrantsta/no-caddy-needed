import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import type { WedgeChartData } from '../service/DbService';

type Props = {
    data: WedgeChartData;
    onSave?: (data: WedgeChartData) => void;
};

type EditableRow = {
    club: string;
    distances: string[];
};

const MAX_CLUBS = 4;
const MAX_DISTANCES = 6;

const WedgeChart = ({ data, onSave }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.wedgeChart;
    const [distanceNames, setDistanceNames] = useState<string[]>(
        data.distanceNames.length > 0 ? [...data.distanceNames] : []
    );
    const [rows, setRows] = useState<EditableRow[]>(
        data.clubs.map(c => ({
            club: c.club,
            distances: c.distances.map(d => String(d.distance)),
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
                    distance: parseInt(r.distances[i]) || 0,
                })),
            })),
        };
        onSave(chartData);
    };

    return (
        <View style={s.container}>
            <View style={s.headerRow}>
                <Text style={[s.headerCell, s.clubCell]}>Club</Text>
                {distanceNames.map((name, i) => (
                    <TextInput
                        key={`dn-${i}`}
                        testID={`distance-name-input-${i}`}
                        style={[s.headerInput, s.distanceCell]}
                        value={name}
                        onChangeText={(v) => handleUpdateDistanceName(i, v)}
                        placeholder="Name"
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                ))}
            </View>

            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={s.row}>
                    <TextInput
                        testID={`wedge-club-input-${rowIndex}`}
                        style={[s.input, s.clubCell]}
                        value={row.club}
                        onChangeText={(v) => handleUpdateClub(rowIndex, v)}
                        placeholder="Club"
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                    {row.distances.map((dist, colIndex) => (
                        <TextInput
                            key={`${rowIndex}-${colIndex}`}
                            testID={`wedge-distance-input-${rowIndex}-${colIndex}`}
                            style={[s.input, s.distanceCell]}
                            value={dist}
                            onChangeText={(v) => handleUpdateDistance(rowIndex, colIndex, v)}
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
                {distanceNames.length < MAX_DISTANCES && (
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
