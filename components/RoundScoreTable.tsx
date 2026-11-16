import colours from '@/assets/colours';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { splitFrontAndBackNine } from '@/utils/holeOrder';

type Hole = { holeNumber: number; par: number; score: number };

// Another player in the round: their score per hole number. Holes they have no score for are missing.
export type OtherPlayer = { id: number; name: string; scores: Record<number, number> };

type Props = {
    holes: Hole[];
    // Shown as extra rows under "You", so the group can compare scores
    otherPlayers?: OtherPlayer[];
    // Holes where a deadly sin was recorded; each gets a dot under the score
    sinHoles: Set<number>;
    // Tapping a dot shows which sins were recorded on that hole
    onSinPress?: (holeNumber: number) => void;
};

type RoundDetailStyles = ReturnType<typeof useStyles>['roundDetail'];

const SIN_DOT_COLOUR = colours.wedgeTile;
const PAR_LEGEND = 'Circle = under par, square = over par';

// Which side of par a score sits on, or null when it is exactly par
const parState = (score: number, par: number): 'under' | 'over' | null => {
    if (score < par) return 'under';
    if (score > par) return 'over';
    return null;
};

// A score in its own text node; off-par scores also sit inside a circle (under) or square (over)
const renderParScore = (
    s: RoundDetailStyles,
    score: number,
    par: number,
    textTestID: string,
    markerTestID: string,
    baseTextStyle: object,
) => {
    const state = parState(score, par);
    const text = (
        <Text
            testID={textTestID}
            style={[s.cell, { flex: 0 }, baseTextStyle, state === 'under' ? s.underParText : state === 'over' ? s.overParText : null]}
        >
            {String(score)}
        </Text>
    );
    if (state === null) return text;
    return (
        <View testID={markerTestID} style={[s.scoreMarker, state === 'under' ? s.birdieMarker : s.bogeyMarker]}>
            {text}
        </View>
    );
};

// One nine: hole numbers, par and the player's score per hole, with the nine's total
const NineTable = ({ label, holes, sinHoles, onSinPress, otherPlayers = [] }: Props & { label: 'OUT' | 'IN' }) => {
    const styles = useStyles();
    const s = styles.roundDetail;
    const totalPar = holes.reduce((sum, h) => sum + h.par, 0);
    const totalScore = holes.reduce((sum, h) => sum + h.score, 0);
    const totalState = parState(totalScore, totalPar);

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
                        <View key={h.holeNumber} testID={`round-table-slot-${h.holeNumber}`} style={s.cellStack}>
                            {renderParScore(
                                s,
                                h.score,
                                h.par,
                                `round-table-score-${h.holeNumber}`,
                                `round-table-marker-${h.holeNumber}`,
                                s.youScore,
                            )}
                            {sinHoles.has(h.holeNumber) ? (
                                <TouchableOpacity
                                    testID={`round-table-dot-${h.holeNumber}`}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Deadly sin on hole ${h.holeNumber}`}
                                    onPress={() => onSinPress?.(h.holeNumber)}
                                    hitSlop={8}
                                    style={s.slotSinDot}
                                />
                            ) : null}
                        </View>
                    ))}
                    <Text
                        testID={`round-table-total-${label.toLowerCase()}`}
                        style={[s.totalCell, s.youScore, totalState === 'under' ? s.underParText : totalState === 'over' ? s.overParText : null]}
                    >
                        {String(totalScore)}
                    </Text>
                </View>
                {otherPlayers.map(player => {
                    const played = holes.filter(h => player.scores[h.holeNumber] !== undefined);
                    const playerTotal = played.reduce((sum, h) => sum + player.scores[h.holeNumber], 0);
                    const playedPar = played.reduce((sum, h) => sum + h.par, 0);
                    const playerState = played.length > 0 ? parState(playerTotal, playedPar) : null;
                    return (
                        <View key={player.id} style={s.tableRow}>
                            <Text numberOfLines={1} style={[s.rowLabel]}>{player.name}</Text>
                            {holes.map(h => {
                                const score = player.scores[h.holeNumber];
                                if (score === undefined) {
                                    return (
                                        <View key={h.holeNumber} style={s.cellStack}>
                                            <Text
                                                testID={`round-table-player-${player.id}-score-${h.holeNumber}`}
                                                style={[s.cell, { flex: 0 }]}
                                            >
                                                -
                                            </Text>
                                        </View>
                                    );
                                }
                                return (
                                    <View key={h.holeNumber} style={s.cellStack}>
                                        {renderParScore(
                                            s,
                                            score,
                                            h.par,
                                            `round-table-player-${player.id}-score-${h.holeNumber}`,
                                            `round-table-player-${player.id}-marker-${h.holeNumber}`,
                                            {},
                                        )}
                                    </View>
                                );
                            })}
                            <Text
                                testID={`round-table-player-${player.id}-total-${label.toLowerCase()}`}
                                style={[
                                    s.totalCell,
                                    playerState === 'under' ? s.underParText : playerState === 'over' ? s.overParText : null,
                                ]}
                            >
                                {played.length > 0 ? String(playerTotal) : '-'}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// The round as tables: an Out table for holes 1 to 9 and an In table for holes 10 to 18
export default function RoundScoreTable({ holes, sinHoles, onSinPress, otherPlayers }: Props) {
    const styles = useStyles();
    const { front: out, back: inward } = splitFrontAndBackNine(holes, h => h.holeNumber);
    const anySin = holes.some(h => sinHoles.has(h.holeNumber));
    const anyOffPar =
        holes.some(h => parState(h.score, h.par) !== null) ||
        (otherPlayers ?? []).some(player =>
            holes.some(h => player.scores[h.holeNumber] !== undefined && parState(player.scores[h.holeNumber], h.par) !== null)
        );

    return (
        <View>
            {out.length > 0 && <NineTable label="OUT" holes={out} sinHoles={sinHoles} onSinPress={onSinPress} otherPlayers={otherPlayers} />}
            {inward.length > 0 && <NineTable label="IN" holes={inward} sinHoles={sinHoles} onSinPress={onSinPress} otherPlayers={otherPlayers} />}
            {anySin ? (
                <View style={styles.roundDetail.legendRow}>
                    <View style={[styles.roundDetail.sinDot, { backgroundColor: SIN_DOT_COLOUR }]} />
                    <Text style={styles.roundDetail.legendText}>Dot marks a hole with a deadly sin</Text>
                </View>
            ) : null}
            {anyOffPar ? (
                <View style={styles.roundDetail.legendRow}>
                    <Text style={styles.roundDetail.legendText}>{PAR_LEGEND}</Text>
                </View>
            ) : null}
        </View>
    );
}
