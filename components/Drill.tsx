import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
    saveDrillResult: (label: string, result: boolean) => void;
    onDelete?: () => void;
};

export default function Drill({ label, iconName, target, objective, setUp, howToPlay, saveDrillResult, onDelete }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const [isAchieved, setIsAchieved] = useState(true);
    const [pendingDelete, setPendingDelete] = useState(false);

    const toggleSwitch = () => {
        setIsAchieved((previousState) => !previousState);
    };

    return (
        <View style={{ padding: 8 }}>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 / 3, padding: 10 }}>
                    <MaterialIcons name={iconName} size={48} color={colours.primary} />
                    <Text style={styles.normalText}>
                        {label}
                    </Text>
                </View>
                <View style={{ flex: 1 / 3 }}>
                    <Text style={styles.drill.contentText}>
                        <Text style={styles.yellowText}>Target:</Text> {target}
                    </Text>
                    <View style={[styles.drill.toggleWrapper, { paddingTop: 10 }]}>
                        <TouchableOpacity
                            testID='drill-met-toggle'
                            style={styles.deadlySinsTally.button}
                            onPress={toggleSwitch}>
                            <Text style={styles.deadlySinsTally.buttonText}>{isAchieved ? '✓' : '○'}</Text>
                        </TouchableOpacity>

                        <Text style={[styles.normalText, { paddingLeft: 10 }]}>
                            {isAchieved ? 'Met' : 'Not met'}
                        </Text>
                    </View>
                </View>
                <View style={{ flex: 1 / 3, alignItems: 'center', alignSelf: 'center' }}>
                    <TouchableOpacity testID='save-drill-result-button' style={styles.button} onPress={
                        () => {
                            saveDrillResult(label, isAchieved);
                        }}>
                        <Text style={styles.buttonText}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>
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
