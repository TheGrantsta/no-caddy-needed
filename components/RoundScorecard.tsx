import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type RoundHole = {
    Id: number;
    RoundId: number;
    HoleNumber: number;
    ScoreRelativeToPar: number;
};

type Props = {
    totalScore: number;
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

const RoundScorecard = ({ totalScore, holes }: Props) => {
    const styles = useStyles();
    const s = styles.roundScorecard;

    const front9 = holes.filter(h => h.HoleNumber <= 9);
    const back9 = holes.filter(h => h.HoleNumber > 9);
    const front9Total = front9.reduce((sum, h) => sum + h.ScoreRelativeToPar, 0);
    const back9Total = back9.reduce((sum, h) => sum + h.ScoreRelativeToPar, 0);

    return (
        <View style={s.container}>
            <Text testID="scorecard-total" style={s.totalScore}>
                {formatScore(totalScore)}
            </Text>

            {front9.length > 0 && (
                <View style={s.nineSection}>
                    <Text style={s.nineHeader}>Front 9</Text>
                    <View style={s.holesGrid}>
                        {front9.map((hole) => (
                            <View key={hole.HoleNumber} style={s.holeCell}>
                                <Text style={s.holeNumber}>{hole.HoleNumber}</Text>
                                <Text
                                    testID={`hole-${hole.HoleNumber}-score`}
                                    style={[
                                        s.holeScore,
                                        hole.ScoreRelativeToPar < 0 && s.underParText,
                                        hole.ScoreRelativeToPar > 0 && s.overParText,
                                    ]}
                                >
                                    {formatHoleScore(hole.ScoreRelativeToPar)}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text testID="front-9-total" style={s.nineTotal}>
                        Front 9: {formatScore(front9Total)}
                    </Text>
                </View>
            )}

            {back9.length > 0 && (
                <View style={s.nineSection}>
                    <Text style={s.nineHeader}>Back 9</Text>
                    <View style={s.holesGrid}>
                        {back9.map((hole) => (
                            <View key={hole.HoleNumber} style={s.holeCell}>
                                <Text style={s.holeNumber}>{hole.HoleNumber}</Text>
                                <Text
                                    testID={`hole-${hole.HoleNumber}-score`}
                                    style={[
                                        s.holeScore,
                                        hole.ScoreRelativeToPar < 0 && s.underParText,
                                        hole.ScoreRelativeToPar > 0 && s.overParText,
                                    ]}
                                >
                                    {formatHoleScore(hole.ScoreRelativeToPar)}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text testID="back-9-total" style={s.nineTotal}>
                        Back 9: {formatScore(back9Total)}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default RoundScorecard;
