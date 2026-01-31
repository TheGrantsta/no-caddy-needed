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
        return undefined;
    };

    const renderHoleGrid = (holes: number[]) => (
        <View>
            <View style={localStyles.gridRow}>
                <View style={localStyles.labelCell} />
                {holes.map(h => (
                    <View key={h} style={localStyles.holeCell}>
                        <Text testID={`hole-number-${h}`} style={localStyles.holeNumberText}>{h}</Text>
                    </View>
                ))}
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
            </View>

            {players.map(player => (
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
                </View>
            ))}
        </View>
    );

    return (
        <View style={localStyles.container}>
            <Text style={localStyles.coursePar}>Par {round.CoursePar}</Text>

            {players.map(player => (
                <View key={player.Id} style={localStyles.totalRow}>
                    <Text style={localStyles.totalPlayerName}>{player.PlayerName}</Text>
                    <Text
                        testID={`player-total-${player.Id}`}
                        style={localStyles.totalScore}
                    >
                        {formatScore(getPlayerTotal(player.Id))}
                    </Text>
                </View>
            ))}

            {front9Holes.length > 0 && (
                <View style={localStyles.nineSection}>
                    <Text style={localStyles.nineHeader}>Front 9</Text>
                    {renderHoleGrid(front9Holes)}
                </View>
            )}

            {back9Holes.length > 0 && (
                <View style={localStyles.nineSection}>
                    <Text style={localStyles.nineHeader}>Back 9</Text>
                    {renderHoleGrid(back9Holes)}
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
    coursePar: {
        color: colours.text,
        fontSize: fontSizes.normal,
        textAlign: 'center',
        marginBottom: 10,
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
        fontSize: fontSizes.smallestText,
    },
    parText: {
        color: colours.text,
        fontSize: fontSizes.smallestText,
    },
    labelText: {
        color: colours.text,
        fontSize: fontSizes.smallestText,
    },
    playerNameText: {
        color: colours.text,
        fontSize: fontSizes.smallestText,
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
});
