import { useState, ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RoundPlayer } from '../service/DbService';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    holeNumber: number;
    players: RoundPlayer[];
    onScoresChange: (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => void;
    initialPar?: number;
    initialScores?: Record<number, number>;
    headerAccessory?: ReactNode;
};

const parOptions = [3, 4, 5];

const buildScoresArray = (players: RoundPlayer[], scores: Record<number, number>, par: number) => {
    return players.map(p => ({
        playerId: p.Id,
        playerName: p.PlayerName,
        score: scores[p.Id] || par,
    }));
};

const HoleScoreInput = ({ holeNumber, players, onScoresChange, initialPar, initialScores, headerAccessory }: Props) => {
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
        <View style={styles.holeScoreInput.container}>
            <View style={styles.holeScoreInput.parRow}>
                <Text testID="hole-number-text" style={styles.holeScoreInput.holeText}>#{holeNumber}</Text>
                {parOptions.map(p => (
                    <TouchableOpacity
                        key={p}
                        testID={`par-${p}-button`}
                        onPress={() => handleParChange(p)}
                        style={[styles.holeScoreInput.parButton, par === p && styles.holeScoreInput.parButtonActive]}
                    >
                        <Text style={[styles.holeScoreInput.parButtonText, par === p && styles.holeScoreInput.parButtonTextActive]}>
                            Par {p}
                        </Text>
                    </TouchableOpacity>
                ))}
                {headerAccessory}
            </View>

            <View testID="players-container">
                {players.map((player) => (
                    <View key={player.Id}>
                        <View style={styles.holeScoreInput.playerRow}>
                            <Text style={styles.holeScoreInput.playerName}>{player.PlayerName}</Text>
                            <View style={styles.holeScoreInput.stepperRow}>
                                <TouchableOpacity
                                    testID={`decrement-${player.Id}`}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Decrease score for ${player.PlayerName}`}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                    onPress={() => handleDecrement(player.Id)}
                                    style={styles.holeScoreInput.stepperButton}
                                >
                                    <Text style={styles.holeScoreInput.stepperButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text testID={`player-score-${player.Id}`} style={styles.holeScoreInput.scoreText}>
                                    {scores[player.Id] || par}
                                </Text>
                                <TouchableOpacity
                                    testID={`increment-${player.Id}`}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Increase score for ${player.PlayerName}`}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                    onPress={() => handleIncrement(player.Id)}
                                    style={styles.holeScoreInput.stepperButton}
                                >
                                    <Text style={styles.holeScoreInput.stepperButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default HoleScoreInput;
