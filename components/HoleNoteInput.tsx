import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    note: string;
    onNoteChange: (text: string) => void;
};

const HoleNoteInput = ({ note, onNoteChange }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <View style={styles.holeNoteInput.container}>
                <TextInput
                    testID="hole-note-input"
                    style={styles.holeNoteInput.input}
                    value={note}
                    onChangeText={onNoteChange}
                    placeholder="Strategy, local knowledge..."
                    placeholderTextColor={styles.holeNoteInput.placeholder.color}
                    multiline
                    autoFocus
                />
            </View>
        );
    }

    if (note.length > 0) {
        return (
            <View style={styles.holeNoteInput.container}>
                <View style={styles.holeNoteInput.noteRow}>
                    <Text testID="hole-note-text" style={styles.holeNoteInput.noteText}>{note}</Text>
                    <TouchableOpacity testID="edit-note-button" onPress={() => setIsEditing(true)}>
                        <MaterialIcons name="edit" size={18} color={colours.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.holeNoteInput.container}>
            <TouchableOpacity
                testID="add-note-button"
                onPress={() => setIsEditing(true)}
                style={styles.holeNoteInput.addButton}
            >
                <MaterialIcons name="add-comment" size={18} color={colours.primary} />
                <Text style={styles.holeNoteInput.addButtonText}>Add note</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HoleNoteInput;
