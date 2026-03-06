import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { insertGameService } from '@/service/DbService';

const MULTILINE_MAX_LENGTH = 100;

type Props = {
    category: string;
    onSaved: () => void;
    onCancel: () => void;
};

export default function AddGameForm({ category, onSaved, onCancel }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showSuccess } = useAppToast();
    const [header, setHeader] = useState('');
    const [objective, setObjective] = useState('');
    const [setUp, setSetUp] = useState('');
    const [howToPlay, setHowToPlay] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveError, setSaveError] = useState('');

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!header.trim()) newErrors.header = 'Name is required';
        if (!objective.trim()) newErrors.objective = 'Objective is required';
        if (!setUp.trim()) newErrors.setUp = 'Set up is required';
        if (!howToPlay.trim()) newErrors.howToPlay = 'How to play is required';
        return newErrors;
    };

    const handleSave = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const success = await insertGameService(category, header.trim(), objective.trim(), setUp.trim(), howToPlay.trim());

        if (success) {
            showSuccess('Game saved');
            onSaved();
        } else {
            setSaveError('Failed to save game');
        }
    };

    const multilineStyle = { minHeight: 55, textAlignVertical: 'top' as const };

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text style={styles.textLabel}>Name</Text>
            <TextInput
                testID='add-game-header'
                style={[styles.textInput, errors.header ? styles.textInputError : undefined]}
                value={header}
                onChangeText={(text) => { setHeader(text); setErrors(e => ({ ...e, header: '' })); }}
                placeholderTextColor={colours.backgroundAlternate}
                placeholder='Name'
            />
            {errors.header ? <Text style={styles.errorText}>{errors.header}</Text> : null}

            <Text style={styles.textLabel}>Objective</Text>
            <TextInput
                testID='add-game-objective'
                style={[styles.textInput, multilineStyle, errors.objective ? styles.textInputError : undefined]}
                value={objective}
                onChangeText={(text) => { setObjective(text); setErrors(e => ({ ...e, objective: '' })); }}
                placeholderTextColor={colours.backgroundAlternate}
                placeholder='Objective'
                multiline
                maxLength={MULTILINE_MAX_LENGTH}
            />
            {errors.objective ? <Text style={styles.errorText}>{errors.objective}</Text> : null}

            <Text style={styles.textLabel}>Set up</Text>
            <TextInput
                testID='add-game-setup'
                style={[styles.textInput, multilineStyle, errors.setUp ? styles.textInputError : undefined]}
                value={setUp}
                onChangeText={(text) => { setSetUp(text); setErrors(e => ({ ...e, setUp: '' })); }}
                placeholderTextColor={colours.backgroundAlternate}
                placeholder='Set up'
                multiline
                maxLength={MULTILINE_MAX_LENGTH}
            />
            {errors.setUp ? <Text style={styles.errorText}>{errors.setUp}</Text> : null}

            <Text style={styles.textLabel}>How to play</Text>
            <TextInput
                testID='add-game-how-to-play'
                style={[styles.textInput, multilineStyle, errors.howToPlay ? styles.textInputError : undefined]}
                value={howToPlay}
                onChangeText={(text) => { setHowToPlay(text); setErrors(e => ({ ...e, howToPlay: '' })); }}
                placeholderTextColor={colours.backgroundAlternate}
                placeholder='How to play'
                multiline
                maxLength={MULTILINE_MAX_LENGTH}
            />
            {errors.howToPlay ? <Text style={styles.errorText}>{errors.howToPlay}</Text> : null}

            {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity testID='add-game-cancel' style={styles.button} onPress={onCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity testID='add-game-save' style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
