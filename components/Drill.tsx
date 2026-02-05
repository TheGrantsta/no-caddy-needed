import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Instructions from "./Instructions";
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from "@/assets/font-sizes";

type Props = {
    label: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    target: string;
    objective: string;
    setUp: string;
    howToPlay: string;
    saveDrillResult: (label: string, result: boolean) => void;
};

export default function Drill({ label, iconName, target, objective, setUp, howToPlay, saveDrillResult }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const [isAchieved, setIsAchieved] = useState(true);

    const localStyles = useMemo(() => StyleSheet.create({
        contentText: {
            marginTop: 5,
            fontSize: fontSizes.normal,
            color: colours.white,
        },
        toggleWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            width: 150,
        },
        toggleContainer: {
            width: 45,
            height: 15,
            borderRadius: 10,
            backgroundColor: colours.backgroundLight,
            justifyContent: 'center',
        },
        toggleOn: {
            backgroundColor: colours.yellow,
        },
        toggleCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colours.backgroundLight,
            alignSelf: 'flex-start',
        },
        circleOn: {
            alignSelf: 'flex-end',
        },
    }), [colours]);

    const toggleSwitch = () => {
        setIsAchieved((previousState) => !previousState);
    };

    return (
        <View>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 / 3, padding: 10 }}>
                    <MaterialIcons name={iconName} size={48} color={colours.white} />
                    <Text style={styles.normalText}>
                        {label}
                    </Text>
                </View>
                <View style={{ flex: 1 / 3 }}>
                    <Text style={localStyles.contentText}>
                        <Text style={styles.yellowText}>Target:</Text> {target}
                    </Text>
                    <View style={[localStyles.toggleWrapper, { paddingTop: 10 }]}>
                        <TouchableOpacity
                            style={[localStyles.toggleContainer, isAchieved && localStyles.toggleOn]}
                            onPress={toggleSwitch}>
                            <View style={[localStyles.toggleCircle, isAchieved && localStyles.circleOn]} />
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
        </View>
    )
};