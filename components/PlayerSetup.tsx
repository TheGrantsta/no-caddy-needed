import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

type Props = {
    onStartRound: (playerNames: string[], courseName: string) => void;
    onCancel?: () => void;
    recentCourseNames?: string[];
    recentPlayerNames?: string[];
};

const MAX_ADDITIONAL_PLAYERS = 3;

const PlayerSetup = ({ onStartRound, onCancel, recentCourseNames, recentPlayerNames }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.playerSetup;
    const [additionalPlayers, setAdditionalPlayers] = useState<string[]>([]);
    const [courseName, setCourseName] = useState('');
    const [courseNameError, setCourseNameError] = useState('');

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

    const handleCourseNameChange = (text: string) => {
        setCourseName(text);
        if (courseNameError) {
            setCourseNameError('');
        }
    };

    const handleRecentPlayerTap = (name: string) => {
        if (additionalPlayers.length < MAX_ADDITIONAL_PLAYERS) {
            setAdditionalPlayers([...additionalPlayers, name]);
        }
    };

    const handleStart = () => {
        const trimmedCourseName = courseName.trim();
        if (trimmedCourseName.length === 0) {
            setCourseNameError('Course name is required');
            return;
        }
        const names = additionalPlayers.filter(name => name.trim().length > 0);
        onStartRound(names, trimmedCourseName);
    };

    return (
        <View style={s.container}>
            <TextInput
                testID="course-name-input"
                style={s.courseNameInput}
                placeholder="Course name"
                placeholderTextColor={colours.backgroundAlternate}
                value={courseName}
                onChangeText={handleCourseNameChange}
            />

            {courseNameError && (
                <Text testID="course-name-error" style={s.errorText}>
                    {courseNameError}
                </Text>
            )}

            {recentCourseNames && recentCourseNames.length > 0 && (
                <View style={s.recentContainer}>
                    <Text style={s.recentLabel}>Recent</Text>
                    {recentCourseNames.map((name) => (
                        <TouchableOpacity
                            key={name}
                            testID={`recent-course-${name}`}
                            onPress={() => handleCourseNameChange(name)}
                            style={s.recentItem}
                        >
                            <Text style={s.recentItemText}>{name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={s.playerRow}>
                <Text style={s.playerName}>You</Text>
            </View>

            {additionalPlayers.map((name, index) => (
                <View key={index} style={s.playerRow}>
                    <TextInput
                        testID={`player-name-input-${index}`}
                        style={s.input}
                        placeholder="Player name"
                        placeholderTextColor={colours.backgroundAlternate}
                        value={name}
                        onChangeText={(text) => handleNameChange(index, text)}
                    />
                    <TouchableOpacity
                        testID={`remove-player-${index}`}
                        onPress={() => handleRemovePlayer(index)}
                        style={s.removeButton}
                    >
                        <Text style={s.removeButtonText}>X</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {recentPlayerNames && recentPlayerNames.length > 0 && additionalPlayers.length < MAX_ADDITIONAL_PLAYERS && (
                <View style={s.recentContainer}>
                    <Text style={s.recentLabel}>Recent players</Text>
                    {recentPlayerNames.map((name) => (
                        <TouchableOpacity
                            key={name}
                            testID={`recent-player-${name}`}
                            onPress={() => handleRecentPlayerTap(name)}
                            style={s.recentItem}
                        >
                            <Text style={s.recentItemText}>{name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {additionalPlayers.length < MAX_ADDITIONAL_PLAYERS && (
                <TouchableOpacity
                    testID="add-player-button"
                    onPress={handleAddPlayer}
                    style={s.addButton}
                >
                    <Text style={s.addButtonText}>+ Add player</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                testID="start-button"
                onPress={handleStart}
                style={s.startButton}
            >
                <Text style={s.startButtonText}>Start</Text>
            </TouchableOpacity>

            {onCancel && (
                <TouchableOpacity
                    testID="cancel-button"
                    onPress={onCancel}
                    style={s.cancelButton}
                >
                    <Text style={s.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default PlayerSetup;
