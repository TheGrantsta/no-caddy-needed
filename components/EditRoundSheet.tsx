import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type HoleSummary = { holeNumber: number; par: number; score: number; putts: number; sins: number };

type Props = {
    courseName: string;
    dateLabel: string;
    holes: HoleSummary[];
    total: number;
    onHolePress: (holeNumber: number) => void;
    onCancel: () => void;
    onSave: () => void;
};

// Step one of editing a round: its details and the list of holes, each opening its own sheet
export default function EditRoundSheet({ courseName, dateLabel, holes, total, onHolePress, onCancel, onSave }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.editRound;

    const summary = (hole: HoleSummary) => {
        const putts = `${hole.putts} ${hole.putts === 1 ? 'putt' : 'putts'}`;
        return hole.sins > 0 ? `${putts} · ${hole.sins} ${hole.sins === 1 ? 'sin' : 'sins'}` : putts;
    };

    return (
        <View>
            <View style={s.headerRow}>
                <TouchableOpacity testID="cancel-edit-button" accessibilityRole="button" onPress={onCancel} style={s.cancelPill}>
                    <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={s.title}>Edit round</Text>
                <TouchableOpacity testID="save-scorecard-button" accessibilityRole="button" onPress={onSave} style={s.savePill}>
                    <Text style={s.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <Text style={s.sectionLabel}>DETAILS</Text>
            <View style={s.card}>
                <View style={s.row}>
                    <Text style={s.rowLabel}>Course</Text>
                    <Text style={s.rowValue}>{courseName}</Text>
                </View>
                <View style={s.divider} />
                <View style={s.row}>
                    <Text style={s.rowLabel}>Date</Text>
                    <Text style={s.rowValue}>{dateLabel}</Text>
                </View>
            </View>

            <View style={s.holesHeader}>
                <Text style={s.sectionLabel}>HOLES</Text>
                <Text style={s.totalText}>{`Total ${total}`}</Text>
            </View>
            <View style={s.card}>
                {holes.map((hole, index) => (
                    <View key={hole.holeNumber}>
                        {index > 0 && <View style={s.divider} />}
                        <TouchableOpacity
                            testID={`edit-round-hole-${hole.holeNumber}`}
                            accessibilityRole="button"
                            onPress={() => onHolePress(hole.holeNumber)}
                            style={s.holeRow}
                        >
                            <View style={s.holeBadge}>
                                <Text style={s.holeBadgeText}>{String(hole.holeNumber)}</Text>
                            </View>
                            <View style={s.holeText}>
                                <Text style={s.holePar}>{`Par ${hole.par}`}</Text>
                                <Text style={s.holeSummary}>{summary(hole)}</Text>
                            </View>
                            <Text style={s.holeScore}>{String(hole.score)}</Text>
                            <MaterialIcons name="chevron-right" size={22} color={colours.tertiary} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
            <Text style={s.footnote}>Tap a hole to change its score and stats.</Text>
        </View>
    );
}
