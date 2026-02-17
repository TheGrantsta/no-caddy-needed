import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';
import { t } from '../assets/i18n/i18n';

type Props = {
    onStartRound: (playerNames: string[], courseName: string) => void;
    onCancel?: () => void;
    recentCourseNames?: string[];
};

const MAX_ADDITIONAL_PLAYERS = 3;

const PlayerSetup = ({ onStartRound, onCancel, recentCourseNames }: Props) => {
    const colours = useThemeColours();
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

    const handleStart = () => {
        const trimmedCourseName = courseName.trim();
        if (trimmedCourseName.length === 0) {
            setCourseNameError(t('playerSetup.courseNameRequired'));
            return;
        }
        const names = additionalPlayers.filter(name => name.trim().length > 0);
        onStartRound(names, trimmedCourseName);
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
        cancelButton: {
            backgroundColor: colours.errorText,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        cancelButtonText: {
            color: colours.white,
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
        errorText: {
            color: colours.errorText,
            fontSize: fontSizes.small,
            marginBottom: 10,
        },
    }), [colours]);

    return (
        <View style={localStyles.container}>
            <TextInput
                testID="course-name-input"
                style={localStyles.courseNameInput}
                placeholder={t('playerSetup.courseNamePlaceholder')}
                placeholderTextColor={colours.backgroundAlternate}
                value={courseName}
                onChangeText={handleCourseNameChange}
            />

            {courseNameError && (
                <Text testID="course-name-error" style={localStyles.errorText}>
                    {courseNameError}
                </Text>
            )}

            {recentCourseNames && recentCourseNames.length > 0 && (
                <View style={localStyles.recentContainer}>
                    <Text style={localStyles.recentLabel}>{t('playerSetup.recent')}</Text>
                    {recentCourseNames.map((name) => (
                        <TouchableOpacity
                            key={name}
                            testID={`recent-course-${name}`}
                            onPress={() => handleCourseNameChange(name)}
                            style={localStyles.recentItem}
                        >
                            <Text style={localStyles.recentItemText}>{name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={localStyles.playerRow}>
                <Text style={localStyles.playerName}>{t('common.you')}</Text>
            </View>

            {additionalPlayers.map((name, index) => (
                <View key={index} style={localStyles.playerRow}>
                    <TextInput
                        testID={`player-name-input-${index}`}
                        style={localStyles.input}
                        placeholder={t('playerSetup.playerNamePlaceholder')}
                        placeholderTextColor={colours.backgroundAlternate}
                        value={name}
                        onChangeText={(text) => handleNameChange(index, text)}
                    />
                    <TouchableOpacity
                        testID={`remove-player-${index}`}
                        onPress={() => handleRemovePlayer(index)}
                        style={localStyles.removeButton}
                    >
                        <Text style={localStyles.removeButtonText}>{t('playerSetup.removePlayer')}</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {additionalPlayers.length < MAX_ADDITIONAL_PLAYERS && (
                <TouchableOpacity
                    testID="add-player-button"
                    onPress={handleAddPlayer}
                    style={localStyles.addButton}
                >
                    <Text style={localStyles.addButtonText}>{t('common.addPlayer')}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                testID="start-button"
                onPress={handleStart}
                style={localStyles.startButton}
            >
                <Text style={localStyles.startButtonText}>{t('common.start')}</Text>
            </TouchableOpacity>

            {onCancel && (
                <TouchableOpacity
                    testID="cancel-button"
                    onPress={onCancel}
                    style={localStyles.cancelButton}
                >
                    <Text style={localStyles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default PlayerSetup;
