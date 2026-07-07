import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Instructions from "./Instructions";
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    label: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    target: string;
    objective: string;
    setUp: string;
    howToPlay: string;
    saveDrillResult: (label: string, score: number) => void;
    onDelete?: () => void;
};

export default function Drill({ label, iconName, target, objective, setUp, howToPlay, saveDrillResult, onDelete }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const [score, setScore] = useState('');
    const [pendingDelete, setPendingDelete] = useState(false);

    return (
        <View style={{ padding: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ paddingTop: 10 }}>
                    <MaterialIcons name={iconName} size={48} color={colours.primary} />
                    <Text style={[styles.normalText, { marginTop: 8, textAlign: 'center' }]}>
                        {label}
                    </Text>
                </View>
                <View style={{ flex: 1, minHeight: 120 }}>
                    <TextInput
                        testID='test-score-input'
                        style={[
                            {
                                borderWidth: 2,
                                borderColor: colours.primary,
                                borderRadius: 8,
                                padding: 16,
                                fontSize: 32,
                                fontWeight: '600',
                                textAlign: 'center',
                                color: colours.text,
                                minHeight: 80,
                            }
                        ]}
                        placeholder={`Aim: ${target}`}
                        placeholderTextColor={colours.primary}
                        keyboardType='number-pad'
                        value={score}
                        onChangeText={setScore}
                        maxLength={2}
                    />
                </View>
                <TouchableOpacity testID='save-drill-result-button' style={[styles.button, { marginTop: 10 }]} onPress={
                    () => {
                        const scoreNum = parseInt(score) || 0;
                        saveDrillResult(label, scoreNum);
                        setScore('');
                    }}>
                    <Text style={styles.buttonText}>
                        Save
                    </Text>
                </TouchableOpacity>
            </View>

            <View>
                <Instructions objective={objective} setUp={setUp} howToPlay={howToPlay} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 8 }}>
                {pendingDelete ? (
                    <>
                        <TouchableOpacity
                            testID='cancel-drill-delete'
                            style={[styles.mediumButton, { backgroundColor: colours.red }]}
                            onPress={() => setPendingDelete(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID='confirm-drill-delete'
                            style={styles.mediumButton}
                            onPress={() => { onDelete?.(); setPendingDelete(false); }}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        testID='delete-drill-button'
                        style={styles.mediumButton}
                        onPress={() => setPendingDelete(true)}>
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>

        </View>
    )
};
