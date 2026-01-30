import { StyleSheet, Text, View } from 'react-native';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type RoundHole = {
    Id: number;
    RoundId: number;
    HoleNumber: number;
    ScoreRelativeToPar: number;
};

type Props = {
    totalScore: number;
    coursePar: number;
    holes: RoundHole[];
};

const formatScore = (score: number): string => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return `${score}`;
};

const formatHoleScore = (score: number): string => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return `${score}`;
};

const RoundScorecard = ({ totalScore, coursePar, holes }: Props) => {
    const front9 = holes.filter(h => h.HoleNumber <= 9);
    const back9 = holes.filter(h => h.HoleNumber > 9);
    const front9Total = front9.reduce((sum, h) => sum + h.ScoreRelativeToPar, 0);
    const back9Total = back9.reduce((sum, h) => sum + h.ScoreRelativeToPar, 0);

    return (
        <View style={localStyles.container}>
            <Text style={localStyles.parText}>Par {coursePar}</Text>
            <Text testID="scorecard-total" style={localStyles.totalScore}>
                {formatScore(totalScore)}
            </Text>

            {front9.length > 0 && (
                <View style={localStyles.nineSection}>
                    <Text style={localStyles.nineHeader}>Front 9</Text>
                    <View style={localStyles.holesGrid}>
                        {front9.map((hole) => (
                            <View key={hole.HoleNumber} style={localStyles.holeCell}>
                                <Text style={localStyles.holeNumber}>{hole.HoleNumber}</Text>
                                <Text
                                    testID={`hole-${hole.HoleNumber}-score`}
                                    style={[
                                        localStyles.holeScore,
                                        hole.ScoreRelativeToPar < 0 && localStyles.underParText,
                                        hole.ScoreRelativeToPar > 0 && localStyles.overParText,
                                    ]}
                                >
                                    {formatHoleScore(hole.ScoreRelativeToPar)}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text testID="front-9-total" style={localStyles.nineTotal}>
                        Front 9: {formatScore(front9Total)}
                    </Text>
                </View>
            )}

            {back9.length > 0 && (
                <View style={localStyles.nineSection}>
                    <Text style={localStyles.nineHeader}>Back 9</Text>
                    <View style={localStyles.holesGrid}>
                        {back9.map((hole) => (
                            <View key={hole.HoleNumber} style={localStyles.holeCell}>
                                <Text style={localStyles.holeNumber}>{hole.HoleNumber}</Text>
                                <Text
                                    testID={`hole-${hole.HoleNumber}-score`}
                                    style={[
                                        localStyles.holeScore,
                                        hole.ScoreRelativeToPar < 0 && localStyles.underParText,
                                        hole.ScoreRelativeToPar > 0 && localStyles.overParText,
                                    ]}
                                >
                                    {formatHoleScore(hole.ScoreRelativeToPar)}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text testID="back-9-total" style={localStyles.nineTotal}>
                        Back 9: {formatScore(back9Total)}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default RoundScorecard;

const localStyles = StyleSheet.create({
    container: {
        padding: 15,
    },
    parText: {
        color: colours.text,
        fontSize: fontSizes.normal,
        textAlign: 'center',
        marginBottom: 5,
    },
    totalScore: {
        color: colours.yellow,
        fontSize: fontSizes.massive,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    nineSection: {
        marginBottom: 15,
    },
    nineHeader: {
        color: colours.yellow,
        fontSize: fontSizes.subHeader,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    holesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    holeCell: {
        width: '11.11%',
        alignItems: 'center',
        paddingVertical: 5,
    },
    holeNumber: {
        color: colours.text,
        fontSize: fontSizes.smallestText,
    },
    holeScore: {
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
    nineTotal: {
        color: colours.text,
        fontSize: fontSizes.normal,
        textAlign: 'right',
        marginTop: 5,
        borderTopWidth: 0.5,
        borderTopColor: colours.yellow,
        paddingTop: 5,
    },
});
