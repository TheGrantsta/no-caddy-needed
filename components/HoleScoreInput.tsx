import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RoundPlayer } from '../service/DbService';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    holeNumber: number;
    players: RoundPlayer[];
    onScoresChange: (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => void;
    initialPar?: number;
    initialScores?: Record<number, number>;
    courseName?: string | null;
    onEndRound?: () => void;
};

const parOptions = [3, 4, 5];

const buildScoresArray = (players: RoundPlayer[], scores: Record<number, number>, par: number) => {
    return players.map(p => ({
        playerId: p.Id,
        playerName: p.PlayerName,
        score: scores[p.Id] || par,
    }));
};

const HoleScoreInput = ({ holeNumber, players, onScoresChange, initialPar, initialScores, courseName, onEndRound }: Props) => {
    const styles = useStyles();
    const defaultPar = initialPar ?? 4;
    const [state, setState] = useState<{ par: number; scores: Record<number, number> }>(() => {
        const scores: Record<number, number> = {};
        players.forEach(p => {
            scores[p.Id] = initialScores?.[p.Id] ?? defaultPar;
        });
        return { par: defaultPar, scores };
    });

    const { par, scores } = state;

    // Only scores still sitting at the old par follow the new par; scores the golfer changed are kept
    const handleParChange = (newPar: number) => {
        const updated: Record<number, number> = {};
        players.forEach(p => { updated[p.Id] = scores[p.Id] === par ? newPar : scores[p.Id]; });
        setState({ par: newPar, scores: updated });
        onScoresChange(holeNumber, newPar, buildScoresArray(players, updated, newPar));
    };

    const handleIncrement = (playerId: number) => {
        const updated = { ...scores, [playerId]: (scores[playerId] || par) + 1 };
        setState({ par, scores: updated });
        onScoresChange(holeNumber, par, buildScoresArray(players, updated, par));
    };

    const handleDecrement = (playerId: number) => {
        const updated = { ...scores, [playerId]: Math.max(1, (scores[playerId] || par) - 1) };
        setState({ par, scores: updated });
        onScoresChange(holeNumber, par, buildScoresArray(players, updated, par));
    };

    return (
        <View style={styles.holeScreen.container}>
            <View style={styles.holeScreen.band}>
                <View style={styles.holeScreen.bandTopRow}>
                    <TouchableOpacity
                        testID="end-round-button"
                        accessibilityRole="button"
                        onPress={() => onEndRound?.()}
                        style={styles.holeScreen.endButton}
                    >
                        <Text style={styles.holeScreen.endButtonText}>End</Text>
                    </TouchableOpacity>
                    <Text testID="hole-course-name" numberOfLines={1} style={styles.holeScreen.courseName}>
                        {courseName ?? ''}
                    </Text>
                    <View style={styles.holeScreen.bandSpacer} />
                </View>
                <View style={styles.holeScreen.bandBottomRow}>
                    <Text testID="hole-number-text" style={styles.holeScreen.holeTitle}>Hole {holeNumber}</Text>
                    <View style={styles.holeScreen.parSegment}>
                        {parOptions.map(p => (
                            <TouchableOpacity
                                key={p}
                                testID={`par-${p}-button`}
                                onPress={() => handleParChange(p)}
                                style={[styles.holeScreen.parOption, par === p && styles.holeScreen.parOptionActive]}
                            >
                                <Text style={[styles.holeScreen.parOptionText, par === p && styles.holeScreen.parOptionTextActive]}>
                                    Par {p}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <Text style={styles.holeScreen.sectionLabel}>Score</Text>
            <View testID="players-container" style={styles.holeScreen.card}>
                {players.map((player, index) => (
                    <View
                        key={player.Id}
                        style={[styles.holeScreen.playerRow, index > 0 && styles.holeScreen.rowDivider]}
                    >
                        <Text style={styles.holeScreen.playerName}>{player.PlayerName}</Text>
                        <View style={styles.holeScreen.stepperRow}>
                            <TouchableOpacity
                                testID={`decrement-${player.Id}`}
                                accessibilityRole="button"
                                accessibilityLabel={`Decrease score for ${player.PlayerName}`}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                onPress={() => handleDecrement(player.Id)}
                                style={styles.holeScreen.minusButton}
                            >
                                <Text style={styles.holeScreen.minusText}>−</Text>
                            </TouchableOpacity>
                            <Text testID={`player-score-${player.Id}`} style={styles.holeScreen.scoreText}>
                                {scores[player.Id] || par}
                            </Text>
                            <TouchableOpacity
                                testID={`increment-${player.Id}`}
                                accessibilityRole="button"
                                accessibilityLabel={`Increase score for ${player.PlayerName}`}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                onPress={() => handleIncrement(player.Id)}
                                style={styles.holeScreen.plusButton}
                            >
                                <Text style={styles.holeScreen.plusText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default HoleScoreInput;
