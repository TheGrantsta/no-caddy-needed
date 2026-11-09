import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import type { RoundSummary as Summary } from '../utils/roundSummary';

type Props = {
    summary: Summary;
    onDone: () => void;
    onViewPerformance: () => void;
};

const slugify = (label: string) => label.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/ +/g, '-');

// Shown when a round is saved, whether it was ended early or finished
const RoundSummary = ({ summary, onDone, onViewPerformance }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.roundSummary;

    return (
        <View style={s.screen}>
            <ScrollView contentContainerStyle={s.content}>
                <View style={s.hero}>
                    <View style={s.checkCircle}>
                        <MaterialIcons name="check" size={44} color={colours.white} />
                    </View>
                    <Text style={s.title}>Round saved</Text>
                    <Text style={s.subtitle}>{summary.subtitle}</Text>
                </View>

                <Text style={styles.holeScreen.sectionLabel}>Strokes</Text>
                <View style={s.card}>
                    {summary.strokes.map((player, index) => (
                        <View key={player.playerId} style={[s.row, index > 0 && s.rowDivider]}>
                            <Text style={s.rowLabel}>{player.name}</Text>
                            <Text testID={`summary-strokes-${player.playerId}`} style={s.rowValue}>{String(player.strokes)}</Text>
                        </View>
                    ))}
                </View>

                {summary.putting && (
                    <>
                        <View style={s.tiles}>
                            <View style={s.tile}>
                                <Text style={s.tileLabel}>Putts</Text>
                                <Text testID="summary-putts" style={s.tileValue}>{String(summary.putting.putts)}</Text>
                            </View>
                            <View style={s.tile}>
                                <Text style={s.tileLabel}>GIR</Text>
                                <Text testID="summary-greens" style={s.tileValue}>
                                    {`${summary.putting.greensInRegulation} of ${summary.putting.holes}`}
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                {summary.sins && (
                    <>
                        <View style={s.sectionHeader}>
                            <Text style={styles.holeScreen.sectionLabel}>Deadly sins</Text>
                            <Text style={styles.holeScreen.sectionLabel}>{`${summary.sins.total} total`}</Text>
                        </View>
                        <View style={s.card}>
                            {summary.sins.rows.map((row, index) => (
                                <View
                                    key={row.label}
                                    testID={`summary-sin-${slugify(row.label)}`}
                                    style={[s.row, index > 0 && s.rowDivider, row.muted && { opacity: 0.5 }]}
                                >
                                    <Text style={s.rowLabel}>{row.label}</Text>
                                    <Text style={s.rowValue}>{String(row.count)}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity testID="round-summary-done-button" accessibilityRole="button" onPress={onDone} style={s.doneButton}>
                    <Text style={s.doneText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="round-summary-performance-button" accessibilityRole="button" onPress={onViewPerformance} style={s.linkButton}>
                    <Text style={s.linkText}>View in Stats</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RoundSummary;
