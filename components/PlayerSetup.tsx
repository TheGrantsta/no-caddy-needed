import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';

type Props = {
    onStartRound: (playerNames: string[], courseName: string) => void;
    recentCourseNames?: string[];
};

const MAX_ADDITIONAL_PLAYERS = 3;

const PlayerSetup = ({ onStartRound, recentCourseNames }: Props) => {
    const colours = useThemeColours();
    const [additionalPlayers, setAdditionalPlayers] = useState<string[]>([]);
    const [courseName, setCourseName] = useState('');

    const handleAddPlayer = () => {
        if (additionalPlayers.length < MAX_ADDITIONAL_PLAYERS) {
            setAdditionalPlayers([...additionalPlayers, '']);
        }
    };

    const handleRemovePlayer = (index: number) => {
        setAdditionalPlayers(additionalPlayers.filter((_, i) => i !== index));
    };

    const handleNameChange = (index: number, name: string) => {
        const updated = [...additionalPlayers];
        updated[index] = name;
        setAdditionalPlayers(updated);
    };

    const handleStart = () => {
        const names = additionalPlayers.filter(name => name.trim().length > 0);
        onStartRound(names, courseName);
    };

    const localStyles = useMemo(() => StyleSheet.create({
        container: {
            padding: 15,
        },
        playerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        playerName: {
            color: colours.yellow,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        input: {
            flex: 1,
            color: colours.text,
            fontSize: fontSizes.normal,
            borderBottomWidth: 1,
            borderBottomColor: colours.yellow,
            paddingVertical: 5,
        },
        courseNameInput: {
            color: colours.text,
            fontSize: fontSizes.normal,
            borderBottomWidth: 1,
            borderBottomColor: colours.yellow,
            paddingVertical: 5,
            marginBottom: 15,
        },
        removeButton: {
            marginLeft: 10,
            padding: 5,
        },
        removeButtonText: {
            color: colours.errorText,
            fontSize: fontSizes.normal,
            fontWeight: 'bold',
        },
        addButton: {
            paddingVertical: 10,
            alignItems: 'center',
        },
        addButtonText: {
            color: colours.yellow,
            fontSize: fontSizes.normal,
        },
        startButton: {
            backgroundColor: colours.yellow,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        startButtonText: {
            color: colours.background,
            fontSize: fontSizes.tableHeader,
            fontWeight: 'bold',
        },
        recentLabel: {
            color: colours.text,
            fontSize: fontSizes.small,
            marginBottom: 5,
        },
        recentItem: {
            paddingVertical: 6,
            paddingHorizontal: 10,
        },
        recentItemText: {
            color: colours.yellow,
            fontSize: fontSizes.normal,
        },
        recentContainer: {
            marginBottom: 10,
        },
    }), [colours]);

    return (
        <View style={localStyles.container}>
            <TextInput
                testID="course-name-input"
                style={localStyles.courseNameInput}
                placeholder="Course name"
                placeholderTextColor={colours.backgroundAlternate}
                value={courseName}
                onChangeText={setCourseName}
            />

            {recentCourseNames && recentCourseNames.length > 0 && (
                <View style={localStyles.recentContainer}>
                    <Text style={localStyles.recentLabel}>Recent</Text>
                    {recentCourseNames.map((name) => (
                        <TouchableOpacity
                            key={name}
                            testID={`recent-course-${name}`}
                            onPress={() => setCourseName(name)}
                            style={localStyles.recentItem}
                        >
                            <Text style={localStyles.recentItemText}>{name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={localStyles.playerRow}>
                <Text style={localStyles.playerName}>You</Text>
            </View>

            {additionalPlayers.map((name, index) => (
                <View key={index} style={localStyles.playerRow}>
                    <TextInput
                        testID={`player-name-input-${index}`}
                        style={localStyles.input}
                        placeholder="Player name"
                        placeholderTextColor={colours.backgroundAlternate}
                        value={name}
                        onChangeText={(text) => handleNameChange(index, text)}
                    />
                    <TouchableOpacity
                        testID={`remove-player-${index}`}
                        onPress={() => handleRemovePlayer(index)}
                        style={localStyles.removeButton}
                    >
                        <Text style={localStyles.removeButtonText}>X</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {additionalPlayers.length < MAX_ADDITIONAL_PLAYERS && (
                <TouchableOpacity
                    testID="add-player-button"
                    onPress={handleAddPlayer}
                    style={localStyles.addButton}
                >
                    <Text style={localStyles.addButtonText}>+ Add player</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                testID="start-button"
                onPress={handleStart}
                style={localStyles.startButton}
            >
                <Text style={localStyles.startButtonText}>Start</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PlayerSetup;
