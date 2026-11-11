import colours from '@/assets/colours';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Hole = { holeNumber: number; par: number; score: number };

type Props = {
    holes: Hole[];
    // Holes where a deadly sin was recorded; each gets a dot under the score
    sinHoles: Set<number>;
    // Tapping a dot shows which sins were recorded on that hole
    onSinPress?: (holeNumber: number) => void;
};

const SIN_DOT_COLOUR = colours.wedgeTile;

// One nine: hole numbers, par and the player's score per hole, with the nine's total
const NineTable = ({ label, holes, sinHoles, onSinPress }: Props & { label: 'OUT' | 'IN' }) => {
    const styles = useStyles();
    const s = styles.roundDetail;
    const totalPar = holes.reduce((sum, h) => sum + h.par, 0);
    const totalScore = holes.reduce((sum, h) => sum + h.score, 0);

    return (
        <View>
            <Text style={s.sectionLabel}>{`SCORECARD · ${label}`}</Text>
            <View testID={`round-table-card-${label.toLowerCase()}`} style={s.tableCard}>
                <View style={[s.tableRow, s.tableHeaderRow]}>
                    <Text style={[s.rowLabel, s.headerText]}>Hole</Text>
                    {holes.map(h => (
                        <Text key={h.holeNumber} style={[s.cell, s.headerText]}>{String(h.holeNumber)}</Text>
                    ))}
                    <Text style={[s.totalCell, s.headerText]}>Tot</Text>
                </View>
                <View style={s.tableRow}>
                    <Text style={[s.rowLabel, s.parText]}>Par</Text>
                    {holes.map(h => (
                        <Text key={h.holeNumber} testID={`round-table-par-${h.holeNumber}`} style={[s.cell, s.parText]}>{String(h.par)}</Text>
                    ))}
                    <Text style={[s.totalCell, s.parText]}>{String(totalPar)}</Text>
                </View>
                <View style={[s.tableRow, s.youRow]}>
                    <Text style={[s.rowLabel, s.youText]}>You</Text>
                    {holes.map(h => (
                        <View key={h.holeNumber} style={s.cellStack}>
                            <Text testID={`round-table-score-${h.holeNumber}`} style={[s.cell, s.youScore]}>{String(h.score)}</Text>
                            {sinHoles.has(h.holeNumber) ? (
                                <TouchableOpacity
                                    testID={`round-table-dot-${h.holeNumber}`}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Deadly sin on hole ${h.holeNumber}`}
                                    onPress={() => onSinPress?.(h.holeNumber)}
                                    hitSlop={8}
                                    style={s.sinDot}
                                />
                            ) : null}
                        </View>
                    ))}
                    <Text style={[s.totalCell, s.youScore]}>{String(totalScore)}</Text>
                </View>
            </View>
        </View>
    );
};

// The round as tables: an Out table for holes 1 to 9 and an In table for holes 10 to 18
export default function RoundScoreTable({ holes, sinHoles, onSinPress }: Props) {
    const styles = useStyles();
    const out = holes.filter(h => h.holeNumber <= 9);
    const inward = holes.filter(h => h.holeNumber >= 10);
    const anySin = holes.some(h => sinHoles.has(h.holeNumber));

    return (
        <View>
            {out.length > 0 && <NineTable label="OUT" holes={out} sinHoles={sinHoles} onSinPress={onSinPress} />}
            {inward.length > 0 && <NineTable label="IN" holes={inward} sinHoles={sinHoles} onSinPress={onSinPress} />}
            {anySin ? (
                <View style={styles.roundDetail.legendRow}>
                    <View style={[styles.roundDetail.sinDot, { backgroundColor: SIN_DOT_COLOUR }]} />
                    <Text style={styles.roundDetail.legendText}>Dot marks a hole with a deadly sin</Text>
                </View>
            ) : null}
        </View>
    );
}
