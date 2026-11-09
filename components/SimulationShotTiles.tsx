import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Option = { value: number; label: string };

type Props = {
    sectionLabel: string;
    options: Option[];
    selected: number;
    onSelect: (value: number) => void;
    testIDPrefix: string;
};

// Row of tappable tiles for picking how many strokes were taken on the current hole
const SimulationShotTiles = ({ sectionLabel, options, selected, onSelect, testIDPrefix }: Props) => {
    const styles = useStyles();
    const s = styles.simulation;

    return (
        <>
            <Text style={s.sectionLabel}>{sectionLabel}</Text>
            <View style={s.tileRow}>
                {options.map(option => {
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
        </>
    );
};

export default SimulationShotTiles;
