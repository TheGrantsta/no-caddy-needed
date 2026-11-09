import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Option = { value: number; label: string };

type Props = {
    sectionLabel: string;
    options: Option[];
    selected: number;
    onSelect: (value: number) => void;
    testIDPrefix: string;
    // Tiles per row; longer option lists wrap onto further rows
    perRow?: number;
};

// Row of tappable tiles for picking how many strokes were taken on the current hole
const SimulationShotTiles = ({ sectionLabel, options, selected, onSelect, testIDPrefix, perRow }: Props) => {
    const styles = useStyles();
    const s = styles.simulation;
    const rowSize = perRow ?? options.length;
    const rows: Option[][] = [];
    for (let i = 0; i < options.length; i += rowSize) {
        rows.push(options.slice(i, i + rowSize));
    }

    return (
        <>
            <Text style={s.sectionLabel}>{sectionLabel}</Text>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} testID={`${testIDPrefix}-row-${rowIndex}`} style={s.tileRow}>
                    {row.map(option => {
                        const isSelected = selected === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                testID={`${testIDPrefix}-${option.value}`}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSelected }}
                                onPress={() => onSelect(option.value)}
                                style={[s.tile, isSelected && s.tileSelected]}
                            >
                                <Text style={[s.tileText, isSelected && s.tileTextSelected]}>{option.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </>
    );
};

export default SimulationShotTiles;
