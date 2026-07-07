import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

type Props = {
    onStartRound: (playerNames: string[], courseName: string) => void;
    onCancel?: () => void;
    recentCourseNames?: string[];
    recentPlayerNames?: string[];
    onRemoveCourse?: (name: string) => void;
    onRemovePlayer?: (name: string) => void;
};

const MAX_ADDITIONAL_PLAYERS = 3;

const PlayerSetup = ({ onStartRound, onCancel, recentCourseNames, recentPlayerNames, onRemoveCourse, onRemovePlayer }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.playerSetup;
    const [additionalPlayers, setAdditionalPlayers] = useState<string[]>([]);
    const [courseName, setCourseName] = useState('');
    const [courseNameError, setCourseNameError] = useState('');
    const [hiddenCourses, setHiddenCourses] = useState<Set<string>>(new Set());
    const [hiddenPlayers, setHiddenPlayers] = useState<Set<string>>(new Set());

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

    const handleRemoveRecentCourse = (name: string) => {
        setHiddenCourses(prev => new Set([...prev, name]));
        onRemoveCourse?.(name);
    };

    const handleRemoveRecentPlayer = (name: string) => {
        setHiddenPlayers(prev => new Set([...prev, name]));
        onRemovePlayer?.(name);
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
        const existingMatch = recentCourseNames?.find(
            name => name.trim().toLowerCase() === trimmedCourseName.toLowerCase()
        );
        const finalCourseName = existingMatch ?? trimmedCourseName;
        const names = additionalPlayers.filter(name => name.trim().length > 0);
        onStartRound(names, finalCourseName);
    };

    return (
        <View style={s.container}>
            <TextInput
                testID="course-name-input"
                style={s.courseNameInput}
                placeholder="Course name"
                placeholderTextColor={colours.tertiary}
                value={courseName}
                onChangeText={handleCourseNameChange}
            />

            {courseNameError && (
                <Text testID="course-name-error" style={s.errorText}>
                    {courseNameError}
                </Text>
            )}

            {recentCourseNames && recentCourseNames.filter(n => !hiddenCourses.has(n)).length > 0 && (
                <View style={s.recentContainer}>
                    <Text style={s.recentLabel}>Recent courses</Text>
                    {recentCourseNames.filter(n => !hiddenCourses.has(n)).map((name) => (
                        <View key={name} style={[s.recentItem, { flexDirection: 'row', alignItems: 'center' }]}>
                            <TouchableOpacity
                                testID={`recent-course-${name}`}
                                onPress={() => handleCourseNameChange(name)}
                                style={{ flex: 1 }}
                            >
                                <Text style={s.recentItemText}>{name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID={`remove-recent-course-${name}`}
                                onPress={() => handleRemoveRecentCourse(name)}
                            >
                                <Text style={s.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
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
                        placeholderTextColor={colours.tertiary}
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

            {recentPlayerNames && recentPlayerNames.filter(n => !hiddenPlayers.has(n)).length > 0 && additionalPlayers.length < MAX_ADDITIONAL_PLAYERS && (
                <View style={s.recentContainer}>
                    <Text style={s.recentLabel}>Recent players</Text>
                    {recentPlayerNames.filter(n => !hiddenPlayers.has(n)).map((name) => (
                        <View key={name} style={[s.recentItem, { flexDirection: 'row', alignItems: 'center' }]}>
                            <TouchableOpacity
                                testID={`recent-player-${name}`}
                                onPress={() => handleRecentPlayerTap(name)}
                                style={{ flex: 1 }}
                            >
                                <Text style={s.recentItemText}>{name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID={`remove-recent-player-${name}`}
                                onPress={() => handleRemoveRecentPlayer(name)}
                            >
                                <Text style={s.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
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
