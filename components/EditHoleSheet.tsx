import React, { ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import PuttingEntry, { PuttingEntryValue } from './PuttingEntry';
import AppSwitch from './AppSwitch';
import { PuttCount } from '../utils/puttingEntry';

type Sins = {
    troubleOffTee: boolean;
    penalties: boolean;
    threePutts: boolean;
    bogeysInside9Iron: boolean;
    doubleChips: boolean;
};

type Props = {
    holeNumber: number;
    par: number;
    strokes: number;
    putting: { putts?: PuttCount; firstPutt?: number; secondPutt?: number; secondIsLong: boolean };
    sins: Sins & Record<string, boolean>;
    onBack: () => void;
    // Saves this hole only; the round sheet is not involved
    onSave: () => void;
    onParChange: (par: number) => void;
    onStrokesChange: (delta: number) => void;
    onPuttingChange: (value: PuttingEntryValue) => void;
    onSinChange: (key: keyof Sins, value: boolean) => void;
    // Score-only rounds record just the strokes, so putting and sins are hidden
    showStats?: boolean;
    // Follow-up pickers (club, penalty type, chip reason) shown under their sin while it is ticked
    renderFollowUp?: (key: keyof Sins) => ReactNode;
    // Other players in the round, each with their own stroke row (the same stepper as hole entry)
    otherPlayers?: { id: number; name: string; strokes: number }[];
    onOtherStrokesChange?: (playerId: number, delta: number) => void;
};

const PAR_OPTIONS = [3, 4, 5];

// The second step of editing a round: one hole's score, putts, green in regulation and sins
const SIN_ROWS: { key: keyof Sins; label: string }[] = [
    { key: 'troubleOffTee', label: 'Trouble off tee' },
    { key: 'penalties', label: 'Penalties' },
    { key: 'threePutts', label: '3-putts' },
    { key: 'bogeysInside9Iron', label: 'Bogeys inside 9-iron' },
    { key: 'doubleChips', label: 'Double chips' },
];

export default function EditHoleSheet({
    holeNumber,
    par,
    strokes,
    putting,
    sins,
    onBack,
    onSave,
    onParChange,
    onStrokesChange,
    onPuttingChange,
    onSinChange,
    showStats = true,
    renderFollowUp,
    otherPlayers = [],
    onOtherStrokesChange,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.editHole;

    return (
        <View>
            <View style={s.headerRow}>
                <TouchableOpacity testID="edit-hole-back-button" accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.backPill}>
                    <MaterialIcons name="chevron-left" size={28} color={colours.black} />
                </TouchableOpacity>
                <Text style={s.title} numberOfLines={1}>{`Hole ${holeNumber}`}</Text>
                <TouchableOpacity testID="edit-hole-save-button" accessibilityRole="button" onPress={onSave} style={s.savePill}>
                    <Text style={s.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <Text style={s.sectionLabel}>SCORE</Text>
            <View style={s.card}>
                <View style={s.row}>
                    <Text style={s.rowLabel}>Par</Text>
                    <View style={s.segmentTrack}>
                        {PAR_OPTIONS.map(option => {
                            const selected = option === par;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    testID={`edit-hole-par-${option}`}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    onPress={() => onParChange(option)}
                                    style={[s.segment, selected && s.segmentSelected]}
                                >
                                    <Text style={[s.segmentText, selected && s.segmentTextSelected]}>{String(option)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                <View style={s.divider} />
                <View style={s.row}>
                    <Text style={s.rowLabel}>{otherPlayers.length > 0 ? 'You' : 'Strokes'}</Text>
                    <View style={s.stepper}>
                        <TouchableOpacity testID="edit-hole-strokes-decrement" accessibilityRole="button" onPress={() => onStrokesChange(-1)} style={s.stepButtonMuted}>
                            <Text style={s.stepText}>−</Text>
                        </TouchableOpacity>
                        <Text testID="edit-hole-strokes-value" style={s.strokesValue}>{String(strokes)}</Text>
                        <TouchableOpacity testID="edit-hole-strokes-increment" accessibilityRole="button" onPress={() => onStrokesChange(1)} style={s.stepButton}>
                            <Text style={[s.stepText, { color: colours.white }]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {otherPlayers.map(player => (
                    <View key={player.id}>
                        <View style={s.divider} />
                        <View style={s.row}>
                            <Text numberOfLines={1} style={s.rowLabel}>{player.name}</Text>
                            <View style={s.stepper}>
                                <TouchableOpacity testID={`edit-hole-player-${player.id}-strokes-decrement`} accessibilityRole="button" onPress={() => onOtherStrokesChange?.(player.id, -1)} style={s.stepButtonMuted}>
                                    <Text style={s.stepText}>−</Text>
                                </TouchableOpacity>
                                <Text testID={`edit-hole-player-${player.id}-strokes-value`} style={s.strokesValue}>{String(player.strokes)}</Text>
                                <TouchableOpacity testID={`edit-hole-player-${player.id}-strokes-increment`} accessibilityRole="button" onPress={() => onOtherStrokesChange?.(player.id, 1)} style={s.stepButton}>
                                    <Text style={[s.stepText, { color: colours.white }]}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {showStats && (
                <>
                <Text style={s.sectionLabel}>PUTTING</Text>
                <View style={s.card}>
                    <PuttingEntry
                        putts={putting.putts}
                        firstPutt={putting.firstPutt}
                        secondPutt={putting.secondPutt}
                        secondIsLong={putting.secondIsLong}
                        onChange={onPuttingChange}
                    />
                </View>

                <Text style={s.sectionLabel}>DEADLY SINS</Text>
                <View style={s.card}>
                    {/* The 3-putt sin follows the putt count: it shows as an automatic row only at 3+ putts, like double bogeys on the hole screen */}
                    {SIN_ROWS.filter(row => row.key !== 'threePutts' || sins.threePutts).map((row, index) => {
                        if (row.key === 'threePutts') {
                            return (
                                <View key={row.key} testID="edit-hole-auto-row-three-putts">
                                    {index > 0 && <View style={s.divider} />}
                                    <View style={s.row}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.rowLabel}>{row.label}</Text>
                                            <Text style={styles.deadlySinsTally.autoCaption}>Auto: 3 or more putts</Text>
                                        </View>
                                        <AppSwitch testID="edit-hole-auto-three-putts" value disabled thumbColor={colours.white} />
                                    </View>
                                </View>
                            );
                        }
                        const marked = sins[row.key];
                        return (
                        <View key={row.key}>
                            {index > 0 && <View style={s.divider} />}
                            <View style={s.row}>
                                <Text style={s.rowLabel}>{row.label}</Text>
                                <AppSwitch
                                    testID={`edit-hole-sin-${row.key}`}
                                    value={marked}
                                    onValueChange={value => onSinChange(row.key, value)}
                                    thumbColor={colours.white}
                                />
                            </View>
                            {marked && renderFollowUp ? (
                                <View testID={`edit-hole-follow-up-${row.key}`} style={styles.deadlySinsTally.followUp}>
                                    {renderFollowUp(row.key)}
                                </View>
                            ) : null}
                        </View>
                        );
                    })}
                </View>
                </>
            )}
        </View>
    );
}
