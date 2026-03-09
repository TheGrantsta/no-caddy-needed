import { Text, TouchableOpacity, View } from 'react-native';
import { RoundPlayer, RoundHoleScore } from '../service/DbService';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    players: RoundPlayer[];
    holeScores: RoundHoleScore[];
    editable?: boolean;
    selectedScore?: { holeNumber: number; playerId: number } | null;
    onScoreSelect?: (holeNumber: number, playerId: number) => void;
};

const formatScore = (score: number): string => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return `${score}`;
};

const Scorecard = ({ players, holeScores, editable, selectedScore, onScoreSelect }: Props) => {
    const styles = useStyles();
    const s = styles.scorecard;

    const holeNumbers = [...new Set(holeScores.map(sc => sc.HoleNumber))].sort((a, b) => a - b);
    const front9Holes = holeNumbers.filter(h => h <= 9);
    const back9Holes = holeNumbers.filter(h => h > 9);

    const getPlayerTotal = (playerId: number): number => {
        return holeScores
            .filter(sc => sc.RoundPlayerId === playerId)
            .reduce((sum, sc) => sum + (sc.Score - sc.HolePar), 0);
    };

    const getPlayerScoreForHole = (playerId: number, holeNumber: number): number | null => {
        const score = holeScores.find(sc => sc.RoundPlayerId === playerId && sc.HoleNumber === holeNumber);
        return score ? score.Score : null;
    };

    const getHolePar = (holeNumber: number): number => {
        const score = holeScores.find(sc => sc.HoleNumber === holeNumber);
        return score ? score.HolePar : 4;
    };

    const getScoreColor = (score: number, par: number) => {
        if (score < par) return s.underParText;
        if (score > par) return s.overParText;
        return s.atParText;
    };

    const getPlayerStrokeTotal = (playerId: number, holes: number[]): number => {
        return holeScores
            .filter(sc => sc.RoundPlayerId === playerId && holes.includes(sc.HoleNumber))
            .reduce((sum, sc) => sum + sc.Score, 0);
    };

    const getParTotalForHoles = (holes: number[]): number => {
        return holes.reduce((sum, h) => sum + getHolePar(h), 0);
    };

    const renderHoleGrid = (holes: number[], nineLabel: string) => {
        const parTotal = getParTotalForHoles(holes);

        return (
            <View>
                <View style={s.gridRow}>
                    <View style={s.labelCell} />
                    {holes.map(h => (
                        <View key={h} style={s.holeCell}>
                            <Text testID={`hole-number-${h}`} style={s.holeNumberText}>{h}</Text>
                        </View>
                    ))}
                    <View style={s.holeCell}>
                        <Text style={s.holeNumberText}>Tot</Text>
                    </View>
                </View>

                <View style={s.gridRow}>
                    <View style={s.labelCell}>
                        <Text style={s.labelText}>Par</Text>
                    </View>
                    {holes.map(h => (
                        <View key={h} style={s.holeCell}>
                            <Text testID={`hole-par-${h}`} style={s.parText}>{getHolePar(h)}</Text>
                        </View>
                    ))}
                    <View style={s.holeCell}>
                        <Text testID={`${nineLabel}-par-total`} style={s.parText}>{parTotal}</Text>
                    </View>
                </View>

                {players.map(player => {
                    const strokeTotal = getPlayerStrokeTotal(player.Id, holes);
                    return (
                        <View key={player.Id} style={s.gridRow}>
                            <View style={s.labelCell}>
                                <Text style={s.playerNameText}>{player.PlayerName}</Text>
                            </View>
                            {holes.map(h => {
                                const score = getPlayerScoreForHole(player.Id, h);
                                const par = getHolePar(h);
                                const isSelected = selectedScore?.holeNumber === h && selectedScore?.playerId === player.Id;
                                const cellContent = (
                                    <Text
                                        testID={`hole-${h}-player-${player.Id}-score`}
                                        style={[s.scoreText, score !== null ? getScoreColor(score, par) : undefined]}
                                    >
                                        {score !== null ? score : '-'}
                                    </Text>
                                );

                                if (editable) {
                                    return (
                                        <TouchableOpacity
                                            key={h}
                                            testID={`score-cell-${h}-${player.Id}`}
                                            style={[s.holeCell, isSelected && s.selectedCell]}
                                            onPress={() => onScoreSelect?.(h, player.Id)}
                                        >
                                            {cellContent}
                                        </TouchableOpacity>
                                    );
                                }

                                return (
                                    <View key={h} style={s.holeCell}>
                                        {cellContent}
                                    </View>
                                );
                            })}
                            <View style={s.holeCell}>
                                <Text
                                    testID={`${nineLabel}-player-${player.Id}-total`}
                                    style={[s.scoreText, getScoreColor(strokeTotal, parTotal)]}
                                >
                                    {strokeTotal}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={s.container}>
            {front9Holes.length > 0 && (
                <View style={s.nineSection}>
                    <Text style={s.nineHeader}>Front 9</Text>
                    {renderHoleGrid(front9Holes, 'front9')}
                </View>
            )}

            {back9Holes.length > 0 && (
                <View style={s.nineSection}>
                    <Text style={s.nineHeader}>Back 9</Text>
                    {renderHoleGrid(back9Holes, 'back9')}
                </View>
            )}

            {holeNumbers.length > 0 && (
                <View style={s.roundTotalSection}>
                    {players.map(player => {
                        const allHoles = [...front9Holes, ...back9Holes];
                        const strokeTotal = getPlayerStrokeTotal(player.Id, allHoles);
                        const parTotal = getParTotalForHoles(allHoles);
                        const relativeTotal = getPlayerTotal(player.Id);
                        return (
                            <View key={player.Id} style={s.totalRow}>
                                <Text style={s.totalPlayerName}>{player.PlayerName}</Text>
                                <Text
                                    testID={`round-player-${player.Id}-total`}
                                    style={[s.totalScore, getScoreColor(strokeTotal, parTotal)]}
                                >
                                    {strokeTotal}
                                </Text>
                                <Text
                                    testID={`player-total-${player.Id}`}
                                    style={[s.totalScore, getScoreColor(relativeTotal, 0)]}
                                >
                                    ({formatScore(relativeTotal)})
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export default Scorecard;
