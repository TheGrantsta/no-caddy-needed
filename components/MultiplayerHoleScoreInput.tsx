import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RoundPlayer } from '../service/DbService';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    holeNumber: number;
    players: RoundPlayer[];
    onSubmitScores: (holeNumber: number, holePar: number, scores: { playerId: number; playerName: string; score: number }[]) => void;
};

const parOptions = [3, 4, 5];

const MultiplayerHoleScoreInput = ({ holeNumber, players, onSubmitScores }: Props) => {
    const [par, setPar] = useState(4);
    const [scores, setScores] = useState<Record<number, number>>({});

    useEffect(() => {
        const initial: Record<number, number> = {};
        players.forEach(p => { initial[p.Id] = 4; });
        setPar(4);
        setScores(initial);
    }, [holeNumber]);

    const handleParChange = (newPar: number) => {
        setPar(newPar);
        const reset: Record<number, number> = {};
        players.forEach(p => { reset[p.Id] = newPar; });
        setScores(reset);
    };

    const handleIncrement = (playerId: number) => {
        setScores(prev => ({ ...prev, [playerId]: (prev[playerId] || par) + 1 }));
    };

    const handleDecrement = (playerId: number) => {
        setScores(prev => ({
            ...prev,
            [playerId]: Math.max(1, (prev[playerId] || par) - 1),
        }));
    };

    const handleSubmit = () => {
        const result = players.map(p => ({
            playerId: p.Id,
            playerName: p.PlayerName,
            score: scores[p.Id] || par,
        }));
        onSubmitScores(holeNumber, par, result);
    };

    return (
        <View style={localStyles.container}>
            <Text style={localStyles.holeText}>Hole {holeNumber}</Text>

            <View style={localStyles.parRow}>
                {parOptions.map(p => (
                    <TouchableOpacity
                        key={p}
                        testID={`par-${p}-button`}
                        onPress={() => handleParChange(p)}
                        style={[localStyles.parButton, par === p && localStyles.parButtonActive]}
                    >
                        <Text style={[localStyles.parButtonText, par === p && localStyles.parButtonTextActive]}>
                            Par {p}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {players.map(player => (
                <View key={player.Id} style={localStyles.playerRow}>
                    <Text style={localStyles.playerName}>{player.PlayerName}</Text>
                    <View style={localStyles.stepperRow}>
                        <TouchableOpacity
                            testID={`decrement-${player.Id}`}
                            onPress={() => handleDecrement(player.Id)}
                            style={localStyles.stepperButton}
                        >
                            <Text style={localStyles.stepperButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text testID={`player-score-${player.Id}`} style={localStyles.scoreText}>
                            {scores[player.Id] || par}
                        </Text>
                        <TouchableOpacity
                            testID={`increment-${player.Id}`}
                            onPress={() => handleIncrement(player.Id)}
                            style={localStyles.stepperButton}
                        >
                            <Text style={localStyles.stepperButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <TouchableOpacity
                testID="next-hole-button"
                onPress={handleSubmit}
                style={localStyles.nextButton}
            >
                <Text style={localStyles.nextButtonText}>Next hole</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MultiplayerHoleScoreInput;

const localStyles = StyleSheet.create({
    container: {
        padding: 15,
    },
    holeText: {
        color: colours.yellow,
        fontSize: fontSizes.header,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    parRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    parButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colours.yellow,
        marginHorizontal: 5,
        borderRadius: 4,
    },
    parButtonActive: {
        backgroundColor: colours.yellow,
    },
    parButtonText: {
        color: colours.yellow,
        fontSize: fontSizes.normal,
        fontWeight: 'bold',
    },
    parButtonTextActive: {
        color: colours.background,
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 5,
    },
    playerName: {
        color: colours.text,
        fontSize: fontSizes.normal,
        flex: 1,
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepperButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colours.yellow,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperButtonText: {
        color: colours.background,
        fontSize: fontSizes.subHeader,
        fontWeight: 'bold',
    },
    scoreText: {
        color: colours.text,
        fontSize: fontSizes.header,
        fontWeight: 'bold',
        marginHorizontal: 15,
        minWidth: 30,
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: colours.yellow,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    nextButtonText: {
        color: colours.background,
        fontSize: fontSizes.tableHeader,
        fontWeight: 'bold',
    },
});
