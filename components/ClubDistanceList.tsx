import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';

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
};

const ClubDistanceList = ({ distances, onSave }: Props) => {
    const colours = useThemeColours();
    const [rows, setRows] = useState<EditableRow[]>(
        distances.map(d => ({ club: d.Club, distance: String(d.CarryDistance), totalDistance: d.TotalDistance }))
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
                CarryDistance: parseInt(r.distance) || 0,
                TotalDistance: r.totalDistance,
                SortOrder: i + 1,
            }));

        onSave(data);
    };

    const localStyles = useMemo(() => StyleSheet.create({
        container: {
            padding: 15,
        },
        headerRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colours.yellow,
            paddingBottom: 8,
            marginBottom: 5,
        },
        row: {
            flexDirection: 'row',
            paddingVertical: 6,
            borderBottomWidth: 0.5,
            borderBottomColor: colours.yellow,
        },
        headerCell: {
            color: colours.yellow,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        cell: {
            color: colours.text,
            fontSize: fontSizes.normal,
        },
        clubCell: {
            flex: 2,
        },
        distanceCell: {
            flex: 1,
            textAlign: 'right',
        },
        emptyText: {
            color: colours.text,
            fontSize: fontSizes.normal,
            textAlign: 'center',
        },
        input: {
            color: colours.text,
            fontSize: fontSizes.normal,
            paddingVertical: 4,
        },
        addButton: {
            padding: 10,
            alignItems: 'center',
            marginTop: 10,
        },
        addButtonText: {
            color: colours.yellow,
            fontSize: fontSizes.normal,
        },
        saveButton: {
            backgroundColor: colours.yellow,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        saveButtonText: {
            color: colours.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
    }), [colours]);

    return (
        <View style={localStyles.container}>
            <View style={localStyles.headerRow}>
                <Text style={[localStyles.headerCell, localStyles.clubCell]}>Club</Text>
                <Text style={[localStyles.headerCell, localStyles.distanceCell]}>Carry (yards)</Text>
            </View>
            {rows.map((row, index) => (
                <View key={index} style={localStyles.row}>
                    <TextInput
                        testID={`club-input-${index}`}
                        style={[localStyles.input, localStyles.clubCell]}
                        value={row.club}
                        onChangeText={(v) => handleUpdateRow(index, 'club', v)}
                        placeholder="Club name"
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                    <TextInput
                        testID={`distance-input-${index}`}
                        style={[localStyles.input, localStyles.distanceCell]}
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
                style={localStyles.addButton}
            >
                {distances.length !== 14 && (
                    <Text style={localStyles.addButtonText}>+ Add club</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                testID="save-distances-button"
                onPress={handleSave}
                style={localStyles.saveButton}
            >
                <Text style={localStyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ClubDistanceList;
