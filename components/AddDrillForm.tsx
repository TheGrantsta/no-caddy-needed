import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { insertDrillService } from '@/service/DbService';

const FIXED_ICON = 'handyman';
const MULTILINE_MAX_LENGTH = 100;

type Props = {
    category: string;
    onSaved: () => void;
    onCancel: () => void;
};

export default function AddDrillForm({ category, onSaved, onCancel }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showSuccess } = useAppToast();
    const [label, setLabel] = useState('');
    const [target, setTarget] = useState('');
    const [objective, setObjective] = useState('');
    const [setUp, setSetUp] = useState('');
    const [howToPlay, setHowToPlay] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveError, setSaveError] = useState('');

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!label.trim()) newErrors.label = 'Name is required';
        if (!target.trim()) newErrors.target = 'Target is required';
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

        const success = await insertDrillService(category, label.trim(), FIXED_ICON, target.trim(), objective.trim(), setUp.trim(), howToPlay.trim());

        if (success) {
            showSuccess('Drill saved');
            onSaved();
        } else {
            setSaveError('Failed to save drill');
        }
    };

    const multilineStyle = { minHeight: 55, textAlignVertical: 'top' as const };

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text style={styles.textLabel}>Name</Text>
            <TextInput
                testID='add-drill-label'
                style={[styles.textInput, errors.label ? styles.textInputError : undefined]}
                value={label}
                onChangeText={(text) => { setLabel(text); setErrors(e => ({ ...e, label: '' })); }}
                placeholderTextColor={colours.backgroundAlternate}
                placeholder='Name'
            />
            {errors.label ? <Text style={styles.errorText}>{errors.label}</Text> : null}

            <Text style={styles.textLabel}>Target</Text>
            <TextInput
                testID='add-drill-target'
                style={[styles.textInput, errors.target ? styles.textInputError : undefined]}
                value={target}
                onChangeText={(text) => { setTarget(text); setErrors(e => ({ ...e, target: '' })); }}
                placeholderTextColor={colours.backgroundAlternate}
                placeholder='Target'
            />
            {errors.target ? <Text style={styles.errorText}>{errors.target}</Text> : null}

            <Text style={styles.textLabel}>Objective</Text>
            <TextInput
                testID='add-drill-objective'
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
                testID='add-drill-setup'
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
                testID='add-drill-how-to-play'
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
                <TouchableOpacity testID='add-drill-cancel' style={styles.button} onPress={onCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity testID='add-drill-save' style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
