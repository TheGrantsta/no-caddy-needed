import { View, Text, TouchableOpacity, ReactNode } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type BandRow = {
    key: string;
    label: string;
    thresholdLabel: string;
    color: string;
};

type Props = {
    title: string;
    summary?: ReactNode;
    bandsSectionLabel?: string;
    bands: BandRow[];
    userBandKey: string;
    onPlayAgain: () => void;
    playAgainTestID?: string;
};

export default function ChallengeCompleteView({
    title,
    summary,
    bandsSectionLabel = 'Your level',
    bands,
    userBandKey,
    onPlayAgain,
    playAgainTestID = 'play-again-button',
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
            <Text style={styles.headerText}>{title}</Text>

            {summary && (
                <View style={{ marginVertical: 24 }}>
                    {summary}
                </View>
            )}

            <Text style={[styles.normalText, { color: colours.gray, marginBottom: 16, marginTop: summary ? 0 : 24 }]}>
                {bandsSectionLabel}
            </Text>

            {bands.map((band) => {
                const isUserBand = band.key === userBandKey;
                return (
                    <View
                        key={band.key}
                        style={{
                            marginBottom: 12,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            backgroundColor: isUserBand ? band.color : 'transparent',
                            borderRadius: 8,
                            borderWidth: isUserBand ? 0 : 1,
                            borderColor: isUserBand ? 'transparent' : colours.gray,
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text
                                style={[
                                    styles.normalText,
                                    { color: isUserBand ? colours.white : 'inherit' },
                                ]}
                            >
                                {band.label}
                            </Text>
                            <Text
                                style={[
                                    styles.normalText,
                                    { color: isUserBand ? colours.white : colours.gray },
                                ]}
                            >
                                {band.thresholdLabel}
                            </Text>
                        </View>
                    </View>
                );
            })}

            <TouchableOpacity
                testID={playAgainTestID}
                onPress={onPlayAgain}
                style={{
                    marginTop: 32,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    backgroundColor: colours.primary,
                    borderRadius: 8,
                    alignItems: 'center',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.normalText, { color: colours.white, fontWeight: '600' }]}>
                        Play Again
                    </Text>
                    <MaterialIcons
                        name="refresh"
                        size={20}
                        color={colours.white}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}
