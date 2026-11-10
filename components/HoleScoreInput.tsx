import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RoundPlayer } from '../service/DbService';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type ScoreChange = { playerId: number; playerName: string; score: number }[];

type Props = {
    holeNumber: number;
    players: RoundPlayer[];
    onScoresChange: (holeNumber: number, holePar: number, scores: ScoreChange) => void;
    initialPar?: number;
    initialScores?: Record<number, number>;
    courseName?: string | null;
    onEndRound?: () => void;
    onOpenBag?: () => void;
};

const parOptions = [3, 4, 5];

const buildScoresArray = (players: RoundPlayer[], scores: Record<number, number>, par: number): ScoreChange => {
    return players.map(p => ({
        playerId: p.Id,
        playerName: p.PlayerName,
        score: scores[p.Id] || par,
    }));
};

type HoleScoresOptions = {
    holeNumber: number;
    players: RoundPlayer[];
    onScoresChange: Props['onScoresChange'];
    initialPar?: number;
    initialScores?: Record<number, number>;
};

// The par and scores for the hole on screen. The state is tagged with its hole number, so moving to
// another hole starts from that hole's saved values without needing a remount.
export const useHoleScores = ({ holeNumber, players, onScoresChange, initialPar, initialScores }: HoleScoresOptions) => {
    const defaultPar = initialPar ?? 4;
    const [saved, setSaved] = useState<{ hole: number; par: number; scores: Record<number, number> } | null>(null);

    const current = saved && saved.hole === holeNumber
        ? saved
        : {
            hole: holeNumber,
            par: defaultPar,
            scores: Object.fromEntries(players.map(p => [p.Id, initialScores?.[p.Id] ?? defaultPar])) as Record<number, number>,
        };
    const { par, scores } = current;

    // Only scores still sitting at the old par follow the new par; scores the golfer changed are kept
    const handleParChange = (newPar: number) => {
        const updated: Record<number, number> = {};
        players.forEach(p => { updated[p.Id] = scores[p.Id] === par ? newPar : scores[p.Id]; });
        setSaved({ hole: holeNumber, par: newPar, scores: updated });
        onScoresChange(holeNumber, newPar, buildScoresArray(players, updated, newPar));
    };

    const handleIncrement = (playerId: number) => {
        const updated = { ...scores, [playerId]: (scores[playerId] || par) + 1 };
        setSaved({ hole: holeNumber, par, scores: updated });
        onScoresChange(holeNumber, par, buildScoresArray(players, updated, par));
    };

    const handleDecrement = (playerId: number) => {
        const updated = { ...scores, [playerId]: Math.max(1, (scores[playerId] || par) - 1) };
        setSaved({ hole: holeNumber, par, scores: updated });
        onScoresChange(holeNumber, par, buildScoresArray(players, updated, par));
    };

    return { par, scores, handleParChange, handleIncrement, handleDecrement };
};

type HeaderProps = {
    holeNumber: number;
    courseName?: string | null;
    par: number;
    onParChange: (par: number) => void;
    onEndRound?: () => void;
    onOpenBag?: () => void;
};

// The green band at the top of the hole: End, course, yardages, hole number and par
export const HoleScoreHeader = ({ holeNumber, courseName, par, onParChange, onEndRound, onOpenBag }: HeaderProps) => {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <View testID="hole-header-pinned" style={styles.holeScreen.container}>
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
                    <View style={styles.holeScreen.bandSpacer}>
                        <TouchableOpacity
                            testID="open-bag-button"
                            accessibilityRole="button"
                            accessibilityLabel="Yardages"
                            onPress={() => onOpenBag?.()}
                            style={styles.holeScreen.bagButton}
                        >
                            <MaterialIcons name="backpack" size={20} color={colours.white} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.holeScreen.bandBottomRow}>
                    <Text testID="hole-number-text" style={styles.holeScreen.holeTitle}>Hole {holeNumber}</Text>
                    <View style={styles.holeScreen.parSegment}>
                        {parOptions.map(p => (
                            <TouchableOpacity
                                key={p}
                                testID={`par-${p}-button`}
                                onPress={() => onParChange(p)}
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
        </View>
    );
};

type BodyProps = {
    players: RoundPlayer[];
    par: number;
    scores: Record<number, number>;
    onIncrement: (playerId: number) => void;
    onDecrement: (playerId: number) => void;
};

// The score steppers for each player on the hole
export const HoleScoreBody = ({ players, par, scores, onIncrement, onDecrement }: BodyProps) => {
    const styles = useStyles();

    return (
        <View style={styles.holeScreen.container}>
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
                                onPress={() => onDecrement(player.Id)}
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
                                onPress={() => onIncrement(player.Id)}
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

// Header and score body together, for places that do not pin the header
const HoleScoreInput = ({ holeNumber, players, onScoresChange, initialPar, initialScores, courseName, onEndRound, onOpenBag }: Props) => {
    const { par, scores, handleParChange, handleIncrement, handleDecrement } = useHoleScores({
        holeNumber, players, onScoresChange, initialPar, initialScores,
    });

    return (
        <View>
            <HoleScoreHeader
                holeNumber={holeNumber}
                courseName={courseName}
                par={par}
                onParChange={handleParChange}
                onEndRound={onEndRound}
                onOpenBag={onOpenBag}
            />
            <HoleScoreBody
                players={players}
                par={par}
                scores={scores}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
            />
        </View>
    );
};

export default HoleScoreInput;
