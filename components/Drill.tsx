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
        <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={{ alignItems: 'center', width: 80 }}>
                    <MaterialIcons name={iconName} size={56} color={colours.primary} />
                    <Text style={[styles.normalText, { marginTop: 8, textAlign: 'center', fontSize: 13 }]}>
                        {label}
                    </Text>
                </View>

                <TextInput
                    testID='test-score-input'
                    style={[
                        {
                            flex: 1,
                            borderWidth: 2,
                            borderColor: colours.primary,
                            borderRadius: 12,
                            padding: 16,
                            fontSize: 24,
                            fontWeight: '600',
                            textAlign: 'center',
                            color: colours.text,
                            height: 70,
                        }
                    ]}
                    placeholder={`Aim: ${target}`}
                    placeholderTextColor={colours.primary}
                    keyboardType='number-pad'
                    value={score}
                    onChangeText={setScore}
                    maxLength={2}
                />

                <TouchableOpacity testID='save-drill-result-button' style={[styles.button, { height: 70 }]} onPress={
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
