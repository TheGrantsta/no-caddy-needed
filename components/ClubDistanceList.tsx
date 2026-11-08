import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { yardsToDisplayUnit, displayUnitToYards, distanceUnitLabel } from '../service/UnitsService';
import CtaButton from './CtaButton';

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
    total: string;
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
        distances.map(d => ({
            club: d.Club,
            distance: String(yardsToDisplayUnit(d.CarryDistance, units)),
            total: d.TotalDistance ? String(yardsToDisplayUnit(d.TotalDistance, units)) : '',
        }))
    );

    const handleAddRow = () => {
        setRows([...rows, { club: '', distance: '', total: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleUpdateRow = (index: number, field: 'club' | 'distance' | 'total', value: string) => {
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
                TotalDistance: displayUnitToYards(parseInt(r.total) || 0, units),
                SortOrder: i + 1,
            }));

        onSave(data);
    };

    return (
        <View style={s.container}>
            <View testID="edit-distances-card" style={s.card}>
                <View style={s.headerRow}>
                    <Text testID="edit-header-club" style={[s.headerText, s.clubCell]}>Club</Text>
                    <Text testID="edit-header-carry" style={[s.headerText, s.headerNumeric]}>{`Carry (${distanceUnitLabel(units)})`}</Text>
                    <Text testID="edit-header-total" style={[s.headerText, s.headerNumeric]}>{`Total (${distanceUnitLabel(units)})`}</Text>
                </View>
                {rows.map((row, index) => (
                    <View key={index} testID={`edit-row-${index}`} style={[s.row, index > 0 && s.rowDivider]}>
                        <TouchableOpacity
                            testID={`remove-club-${index}`}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${row.club || 'club'}`}
                            onPress={() => handleRemoveRow(index)}
                            style={s.removeButton}
                        >
                            <MaterialIcons name="remove-circle" size={24} color={colours.red} />
                        </TouchableOpacity>
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
                            style={[s.input, s.distanceInput]}
                            value={row.distance}
                            onChangeText={(v) => handleUpdateRow(index, 'distance', v)}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colours.backgroundAlternate}
                        />
                        <TextInput
                            testID={`total-input-${index}`}
                            style={[s.input, s.distanceInput]}
                            value={row.total}
                            onChangeText={(v) => handleUpdateRow(index, 'total', v)}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colours.backgroundAlternate}
                        />
                    </View>
                ))}
            </View>

            <TouchableOpacity
                testID="add-club-button"
                onPress={handleAddRow}
                style={s.addButton}
            >
                {distances.length !== 14 && (
                    <>
                        <MaterialIcons name="add" size={20} color={colours.primary} />
                        <Text style={s.addButtonText}>Add club</Text>
                    </>
                )}
            </TouchableOpacity>

            <CtaButton
                testID="save-distances-button"
                label="Save"
                icon="save"
                onPress={handleSave}
                style={s.saveButton}
            />
        </View>
    );
};

export default ClubDistanceList;
