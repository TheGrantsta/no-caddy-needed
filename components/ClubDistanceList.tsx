import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { yardsToDisplayUnit, displayUnitToYards } from '../service/UnitsService';

type ClubDistance = {
    Id: number;
    Club: string;
    CarryDistance: number;
    TotalDistance: number;
    SortOrder: number;
};

type EditableRow = {
    club: string;
    distance: string;
    totalDistance: number;
};

type Props = {
    distances: ClubDistance[];
    onSave?: (distances: { Club: string; CarryDistance: number; TotalDistance: number; SortOrder: number }[]) => void;
    units?: 'yards' | 'metres';
};

const ClubDistanceList = ({ distances, onSave, units = 'yards' }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.clubDistanceList;
    const [rows, setRows] = useState<EditableRow[]>(
        distances.map(d => ({ club: d.Club, distance: String(yardsToDisplayUnit(d.CarryDistance, units)), totalDistance: d.TotalDistance }))
    );

    const handleAddRow = () => {
        setRows([...rows, { club: '', distance: '', totalDistance: 0 }]);
    };

    const handleUpdateRow = (index: number, field: 'club' | 'distance', value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    const handleSave = () => {
        if (!onSave) return;

        const data = rows
            .filter(r => r.club.trim() && r.distance.trim())
            .map((r, i) => ({
                Club: r.club.trim(),
                CarryDistance: displayUnitToYards(parseInt(r.distance) || 0, units),
                TotalDistance: r.totalDistance,
                SortOrder: i + 1,
            }));

        onSave(data);
    };

    return (
        <View style={s.container}>
            <View style={s.headerRow}>
                <View style={[s.headerCell, s.clubCell]}>
                    <Text style={s.headerCell}>Club</Text>
                </View>
                <View style={[s.headerCell, s.distanceCell]}>
                    <Text style={s.headerCell}>Distance</Text>
                </View>
            </View>
            {rows.map((row, index) => (
                <View key={index} style={[s.row, index === rows.length - 1 && { borderBottomWidth: 0.5 }]}>
                    <TextInput
                        testID={`club-input-${index}`}
                        style={[s.input, s.clubCell]}
                        value={row.club}
                        onChangeText={(v) => handleUpdateRow(index, 'club', v)}
                        placeholder="Club"
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                    <TextInput
                        testID={`distance-input-${index}`}
                        style={[s.input, s.distanceCell]}
                        value={row.distance}
                        onChangeText={(v) => handleUpdateRow(index, 'distance', v)}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                </View>
            ))}

            <TouchableOpacity
                testID="add-club-button"
                onPress={handleAddRow}
                style={s.addButton}
            >
                {distances.length !== 14 && (
                    <Text style={s.addButtonText}>+ Add club</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                testID="save-distances-button"
                onPress={handleSave}
                style={s.saveButton}
            >
                <Text style={s.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ClubDistanceList;
