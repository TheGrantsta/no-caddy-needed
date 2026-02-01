import { StyleSheet, Text, View } from 'react-native';
import { Round, RoundPlayer, RoundHoleScore } from '../service/DbService';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    round: Round;
    players: RoundPlayer[];
    holeScores: RoundHoleScore[];
};

const formatScore = (score: number): string => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return `${score}`;
};

const MultiplayerScorecard = ({ round, players, holeScores }: Props) => {
    const holeNumbers = [...new Set(holeScores.map(s => s.HoleNumber))].sort((a, b) => a - b);
    const front9Holes = holeNumbers.filter(h => h <= 9);
    const back9Holes = holeNumbers.filter(h => h > 9);

    const getPlayerTotal = (playerId: number): number => {
        return holeScores
            .filter(s => s.RoundPlayerId === playerId)
            .reduce((sum, s) => sum + (s.Score - s.HolePar), 0);
    };

    const getPlayerScoreForHole = (playerId: number, holeNumber: number): number | null => {
        const score = holeScores.find(s => s.RoundPlayerId === playerId && s.HoleNumber === holeNumber);
        return score ? score.Score : null;
    };

    const getHolePar = (holeNumber: number): number => {
        const score = holeScores.find(s => s.HoleNumber === holeNumber);
        return score ? score.HolePar : 4;
    };

    const getScoreColor = (score: number, par: number) => {
        if (score < par) return localStyles.underParText;
        if (score > par) return localStyles.overParText;
        return localStyles.atParText;
    };

    const getPlayerStrokeTotal = (playerId: number, holes: number[]): number => {
        return holeScores
            .filter(s => s.RoundPlayerId === playerId && holes.includes(s.HoleNumber))
            .reduce((sum, s) => sum + s.Score, 0);
    };

    const getParTotalForHoles = (holes: number[]): number => {
        return holes.reduce((sum, h) => sum + getHolePar(h), 0);
    };

    const renderHoleGrid = (holes: number[], nineLabel: string) => {
        const parTotal = getParTotalForHoles(holes);

        return (
            <View>
                <View style={localStyles.gridRow}>
                    <View style={localStyles.labelCell} />
                    {holes.map(h => (
                        <View key={h} style={localStyles.holeCell}>
                            <Text testID={`hole-number-${h}`} style={localStyles.holeNumberText}>{h}</Text>
                        </View>
                    ))}
                    <View style={localStyles.holeCell}>
                        <Text style={localStyles.holeNumberText}>Tot</Text>
                    </View>
                </View>

                <View style={localStyles.gridRow}>
                    <View style={localStyles.labelCell}>
                        <Text style={localStyles.labelText}>Par</Text>
                    </View>
                    {holes.map(h => (
                        <View key={h} style={localStyles.holeCell}>
                            <Text testID={`hole-par-${h}`} style={localStyles.parText}>{getHolePar(h)}</Text>
                        </View>
                    ))}
                    <View style={localStyles.holeCell}>
                        <Text testID={`${nineLabel}-par-total`} style={localStyles.parText}>{parTotal}</Text>
                    </View>
                </View>

                {players.map(player => {
                    const strokeTotal = getPlayerStrokeTotal(player.Id, holes);
                    return (
                        <View key={player.Id} style={localStyles.gridRow}>
                            <View style={localStyles.labelCell}>
                                <Text style={localStyles.playerNameText}>{player.PlayerName}</Text>
                            </View>
                            {holes.map(h => {
                                const score = getPlayerScoreForHole(player.Id, h);
                                const par = getHolePar(h);
                                return (
                                    <View key={h} style={localStyles.holeCell}>
                                        <Text
                                            testID={`hole-${h}-player-${player.Id}-score`}
                                            style={[localStyles.scoreText, score !== null ? getScoreColor(score, par) : undefined]}
                                        >
                                            {score !== null ? score : '-'}
                                        </Text>
                                    </View>
                                );
                            })}
                            <View style={localStyles.holeCell}>
                                <Text
                                    testID={`${nineLabel}-player-${player.Id}-total`}
                                    style={[localStyles.scoreText, getScoreColor(strokeTotal, parTotal)]}
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
        <View style={localStyles.container}>
            {front9Holes.length > 0 && (
                <View style={localStyles.nineSection}>
                    <Text style={localStyles.nineHeader}>Front 9</Text>
                    {renderHoleGrid(front9Holes, 'front9')}
                </View>
            )}

            {back9Holes.length > 0 && (
                <View style={localStyles.nineSection}>
                    <Text style={localStyles.nineHeader}>Back 9</Text>
                    {renderHoleGrid(back9Holes, 'back9')}
                </View>
            )}

            {holeNumbers.length > 0 && (
                <View style={localStyles.roundTotalSection}>
                    {players.map(player => {
                        const allHoles = [...front9Holes, ...back9Holes];
                        const strokeTotal = getPlayerStrokeTotal(player.Id, allHoles);
                        const parTotal = getParTotalForHoles(allHoles);
                        const relativeTotal = getPlayerTotal(player.Id);
                        return (
                            <View key={player.Id} style={localStyles.totalRow}>
                                <Text style={localStyles.totalPlayerName}>{player.PlayerName}</Text>
                                <Text
                                    testID={`round-player-${player.Id}-total`}
                                    style={[localStyles.totalScore, getScoreColor(strokeTotal, parTotal)]}
                                >
                                    {strokeTotal}
                                </Text>
                                <Text
                                    testID={`player-total-${player.Id}`}
                                    style={[localStyles.totalScore, getScoreColor(relativeTotal, 0)]}
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

export default MultiplayerScorecard;

const localStyles = StyleSheet.create({
    container: {
        padding: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    totalPlayerName: {
        color: colours.text,
        fontSize: fontSizes.normal,
    },
    totalScore: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
    },
    nineSection: {
        marginTop: 15,
    },
    nineHeader: {
        color: colours.yellow,
        fontSize: fontSizes.subHeader,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelCell: {
        width: 60,
        paddingVertical: 4,
    },
    holeCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    holeNumberText: {
        color: colours.text,
        fontSize: fontSizes.normal,
    },
    parText: {
        color: colours.text,
        fontSize: fontSizes.normal,
    },
    labelText: {
        color: colours.text,
        fontSize: fontSizes.normal,
    },
    playerNameText: {
        color: colours.text,
        fontSize: fontSizes.normal,
    },
    scoreText: {
        color: colours.text,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
    },
    underParText: {
        color: colours.green,
    },
    overParText: {
        color: colours.errorText,
    },
    atParText: {
        color: colours.yellow,
    },
    roundTotalSection: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: colours.yellow,
        paddingTop: 10,
    },
});
