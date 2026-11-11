import React, { ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import PuttDistancePicker from './PuttDistancePicker';

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
    firstPutt: string;
    secondPutt: string;
    greenInRegulation: boolean;
    sins: Sins & Record<string, boolean>;
    onBack: () => void;
    onParChange: (par: number) => void;
    onStrokesChange: (delta: number) => void;
    onFirstPuttChange: (value: string) => void;
    onSecondPuttChange: (value: string) => void;
    onGreenInRegulationChange: (value: boolean) => void;
    onSinChange: (key: keyof Sins, value: boolean) => void;
    // Score-only rounds record just the strokes, so putting and sins are hidden
    showStats?: boolean;
    // Follow-up pickers (club, penalty type, chip reason) shown under their sin while it is ticked
    renderFollowUp?: (key: keyof Sins) => ReactNode;
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
    firstPutt,
    secondPutt,
    greenInRegulation,
    sins,
    onBack,
    onParChange,
    onStrokesChange,
    onFirstPuttChange,
    onSecondPuttChange,
    onGreenInRegulationChange,
    onSinChange,
    showStats = true,
    renderFollowUp,
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
                <View style={s.spacer} />
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
                    <Text style={s.rowLabel}>Strokes</Text>
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
            </View>

            {showStats && (
                <>
                <Text style={s.sectionLabel}>PUTTING</Text>
                <View style={s.card}>
                    <View style={s.row}>
                        <Text style={s.rowLabel}>1st putt</Text>
                        <View style={s.puttValue}>
                            <PuttDistancePicker testID="first-putt-input" value={firstPutt} maxDistance={100} onChange={onFirstPuttChange} />
                            <Text style={s.unit}>ft</Text>
                        </View>
                    </View>
                    <View style={s.divider} />
                    <View style={s.row}>
                        <Text style={s.rowLabel}>2nd putt</Text>
                        <View style={s.puttValue}>
                            <PuttDistancePicker testID="second-putt-input" value={secondPutt} maxDistance={100} onChange={onSecondPuttChange} />
                            <Text style={s.unit}>ft</Text>
                        </View>
                    </View>
                    <View style={s.divider} />
                    <View style={s.row}>
                        <Text style={s.rowLabel}>Green in regulation</Text>
                        <Switch
                            testID="edit-hole-gir-switch"
                            value={greenInRegulation}
                            onValueChange={onGreenInRegulationChange}
                            trackColor={{ false: '#E9E9EB', true: colours.primary }}
                            thumbColor={colours.white}
                        />
                    </View>
                </View>

                <Text style={s.sectionLabel}>DEADLY SINS</Text>
                <View style={s.card}>
                    {SIN_ROWS.map((row, index) => (
                        <View key={row.key}>
                            {index > 0 && <View style={s.divider} />}
                            <View style={s.row}>
                                <Text style={s.rowLabel}>{row.label}</Text>
                                <Switch
                                    testID={`edit-hole-sin-${row.key}`}
                                    value={sins[row.key]}
                                    onValueChange={value => onSinChange(row.key, value)}
                                    trackColor={{ false: '#E9E9EB', true: colours.primary }}
                                    thumbColor={colours.white}
                                />
                            </View>
                            {sins[row.key] && renderFollowUp ? (
                                <View testID={`edit-hole-follow-up-${row.key}`} style={styles.deadlySinsTally.followUp}>
                                    {renderFollowUp(row.key)}
                                </View>
                            ) : null}
                        </View>
                    ))}
                </View>
                </>
            )}
        </View>
    );
}
