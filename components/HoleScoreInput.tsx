import { useEffect, useState, ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RoundPlayer } from '../service/DbService';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    holeNumber: number;
    players: RoundPlayer[];
    onScoresChange: (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => void;
    renderAfterUser?: ReactNode;
};

const parOptions = [3, 4, 5];

const buildScoresArray = (players: RoundPlayer[], scores: Record<number, number>, par: number) => {
    return players.map(p => ({
        playerId: p.Id,
        playerName: p.PlayerName,
        score: scores[p.Id] || par,
    }));
};

const HoleScoreInput = ({ holeNumber, players, onScoresChange, renderAfterUser }: Props) => {
    const styles = useStyles();
    const [state, setState] = useState<{ par: number; scores: Record<number, number> }>({ par: 4, scores: {} });

    useEffect(() => {
        const initial: Record<number, number> = {};
        players.forEach(p => { initial[p.Id] = 4; });
        setState({ par: 4, scores: initial });
    }, [holeNumber]);

    const { par, scores } = state;

    const handleParChange = (newPar: number) => {
        const reset: Record<number, number> = {};
        players.forEach(p => { reset[p.Id] = newPar; });
        setState({ par: newPar, scores: reset });
        onScoresChange(holeNumber, newPar, buildScoresArray(players, reset, newPar));
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
                <Text style={styles.holeScoreInput.holeText}>#{holeNumber}</Text>
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
            </View>

            <View testID="players-container">
                {players.map((player) => (
                    <View key={player.Id}>
                        <View style={styles.holeScoreInput.playerRow}>
                            <Text style={styles.holeScoreInput.playerName}>{player.PlayerName}</Text>
                            <View style={styles.holeScoreInput.stepperRow}>
                                <TouchableOpacity
                                    testID={`decrement-${player.Id}`}
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
                                    onPress={() => handleIncrement(player.Id)}
                                    style={styles.holeScoreInput.stepperButton}
                                >
                                    <Text style={styles.holeScoreInput.stepperButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {player.IsUser === 1 && renderAfterUser}
                    </View>
                ))}
            </View>
        </View>
    );
};

export default HoleScoreInput;
