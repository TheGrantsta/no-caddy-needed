import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';
import { t } from '../assets/i18n/i18n';
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
    const colours = useThemeColours();
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
        headerInput: {
            color: colours.yellow,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
            paddingVertical: 4,
        },
        clubCell: {
            flex: 2,
        },
        distanceCell: {
            flex: 1,
            textAlign: 'right',
        },
        input: {
            color: colours.text,
            fontSize: fontSizes.normal,
            paddingVertical: 4,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 10,
        },
        addButton: {
            padding: 10,
            alignItems: 'center',
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
                <Text style={[localStyles.headerCell, localStyles.clubCell]}>{t('wedgeChartComponent.clubHeader')}</Text>
                {distanceNames.map((name, i) => (
                    <TextInput
                        key={`dn-${i}`}
                        testID={`distance-name-input-${i}`}
                        style={[localStyles.headerInput, localStyles.distanceCell]}
                        value={name}
                        onChangeText={(v) => handleUpdateDistanceName(i, v)}
                        placeholder={t('wedgeChartComponent.namePlaceholder')}
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                ))}
            </View>

            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={localStyles.row}>
                    <TextInput
                        testID={`wedge-club-input-${rowIndex}`}
                        style={[localStyles.input, localStyles.clubCell]}
                        value={row.club}
                        onChangeText={(v) => handleUpdateClub(rowIndex, v)}
                        placeholder={t('wedgeChartComponent.clubPlaceholder')}
                        placeholderTextColor={colours.backgroundAlternate}
                    />
                    {row.distances.map((dist, colIndex) => (
                        <TextInput
                            key={`${rowIndex}-${colIndex}`}
                            testID={`wedge-distance-input-${rowIndex}-${colIndex}`}
                            style={[localStyles.input, localStyles.distanceCell]}
                            value={dist}
                            onChangeText={(v) => handleUpdateDistance(rowIndex, colIndex, v)}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colours.backgroundAlternate}
                        />
                    ))}
                </View>
            ))}

            <View style={localStyles.buttonRow}>
                {rows.length < MAX_CLUBS && (
                    <TouchableOpacity
                        testID="add-wedge-club-button"
                        onPress={handleAddClub}
                        style={localStyles.addButton}
                    >
                        <Text style={localStyles.addButtonText}>{t('common.addClub')}</Text>
                    </TouchableOpacity>
                )}
                {distanceNames.length < MAX_DISTANCES && (
                    <TouchableOpacity
                        testID="add-wedge-distance-button"
                        onPress={handleAddDistance}
                        style={localStyles.addButton}
                    >
                        <Text style={localStyles.addButtonText}>{t('common.addDistance')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                testID="save-wedge-chart-button"
                onPress={handleSave}
                style={localStyles.saveButton}
            >
                <Text style={localStyles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default WedgeChart;
