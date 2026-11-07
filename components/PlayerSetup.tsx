import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

type Props = {
    onStartRound: (playerNames: string[], courseName: string) => void;
    recentCourseNames?: string[];
    onRemoveCourse?: (name: string) => void;
};

const MAX_ADDITIONAL_PLAYERS = 3;

const sameCourse = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const PlayerSetup = ({ onStartRound, recentCourseNames, onRemoveCourse }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.playerSetup;
    const [additionalPlayers, setAdditionalPlayers] = useState<string[]>([]);
    const [courseName, setCourseName] = useState('');
    const [courseNameError, setCourseNameError] = useState('');
    const [hiddenCourses, setHiddenCourses] = useState<Set<string>>(new Set());

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

    const handleStart = () => {
        const trimmedCourseName = courseName.trim();
        if (trimmedCourseName.length === 0) {
            setCourseNameError('Course name is required');
            return;
        }
        const existingMatch = recentCourseNames?.find(name => sameCourse(name, trimmedCourseName));
        const finalCourseName = existingMatch ?? trimmedCourseName;
        const names = additionalPlayers.filter(name => name.trim().length > 0);
        onStartRound(names, finalCourseName);
    };

    // The search field filters the recent list; an empty field shows every recent course
    const query = courseName.trim().toLowerCase();
    const matchingCourses = (recentCourseNames ?? [])
        .filter(name => !hiddenCourses.has(name))
        .filter(name => query === '' || name.toLowerCase().includes(query));

    return (
        <View style={s.container}>
            <View style={s.searchContainer}>
                <TextInput
                    testID="course-name-input"
                    style={[s.searchInput, courseNameError ? styles.textInputError : {}]}
                    placeholder="Course name"
                    placeholderTextColor={colours.tertiary}
                    value={courseName}
                    onChangeText={handleCourseNameChange}
                    returnKeyType="done"
                />
            </View>

            {courseNameError && (
                <Text testID="course-name-error" style={s.errorText}>
                    {courseNameError}
                </Text>
            )}

            {matchingCourses.length > 0 && (
                <View>
                    <Text testID="recent-courses-label" style={s.sectionLabel}>Recent</Text>
                    <View style={s.card}>
                        {matchingCourses.map((name, index) => {
                            const selected = sameCourse(name, courseName);
                            return (
                                <View key={name}>
                                    {index > 0 && <View style={s.cardDivider} />}
                                    <ReanimatedSwipeable
                                        renderRightActions={() => (
                                            <TouchableOpacity
                                                testID={`delete-recent-course-${name}`}
                                                onPress={() => handleRemoveRecentCourse(name)}
                                                style={s.deleteAction}
                                            >
                                                <MaterialIcons name="delete-outline" size={22} color={colours.white} />
                                                <Text style={s.deleteActionText}>Delete</Text>
                                            </TouchableOpacity>
                                        )}
                                    >
                                        <TouchableOpacity
                                            testID={`recent-course-${name}`}
                                            onPress={() => handleCourseNameChange(name)}
                                            style={[s.cardRow, { backgroundColor: colours.backgroundLight }]}
                                        >
                                            <Text style={s.courseRowText}>{name}</Text>
                                            {selected && (
                                                <View testID={`recent-course-selected-${name}`}>
                                                    <MaterialIcons name="check" size={22} color={colours.primary} />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </ReanimatedSwipeable>
                                </View>
                            );
                        })}
                    </View>
                    <Text style={s.hintText}>Swipe left on a course to remove it.</Text>
                </View>
            )}

            <Text style={s.sectionLabel}>Players</Text>
            <View style={s.card}>
                <View style={s.cardRow}>
                    <View testID="player-you-avatar" style={s.avatar}>
                        <Text style={s.avatarText}>You</Text>
                    </View>
                    <Text testID="player-you-host-label" style={s.hostText}>Host</Text>
                </View>

                {additionalPlayers.map((name, index) => (
                    <View key={index}>
                        <View style={s.cardDivider} />
                        <View style={s.cardRow}>
                            <TextInput
                                testID={`player-name-input-${index}`}
                                returnKeyType="done"
                                style={[s.input, { flex: 1 }]}
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
                    </View>
                ))}

                {additionalPlayers.length < MAX_ADDITIONAL_PLAYERS && (
                    <>
                        <View style={s.cardDivider} />
                        <TouchableOpacity
                            testID="add-player-button"
                            onPress={handleAddPlayer}
                            style={[s.cardRow, { columnGap: 12 }]}
                        >
                            <MaterialIcons name="add-circle-outline" size={24} color={colours.primary} />
                            <Text style={s.addButtonText}>Add player</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <TouchableOpacity
                testID="start-button"
                onPress={handleStart}
                style={[s.startButton, s.startButtonFooter]}
            >
                <MaterialIcons name="play-arrow" size={20} color={colours.white} />
                <Text style={s.startButtonText}>Start round</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PlayerSetup;
