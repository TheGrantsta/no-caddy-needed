import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    isEditing: boolean;
    showSaveConfirm: boolean;
    onDelete: () => void;
    onCancelEdit: () => void;
    onSave: () => void;
    onCancelSave: () => void;
    onConfirmSave: () => void;
}

export default function ScorecardActionButtons({
    isEditing,
    showSaveConfirm,
    onDelete,
    onCancelEdit,
    onSave,
    onCancelSave,
    onConfirmSave,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <>
            {/* Spacer fills gap when not editing/deleting */}
            {!isEditing && <View style={{ flexGrow: 1 }} />}

            {/* Delete button */}
            {!isEditing && (
                <TouchableOpacity
                    testID="delete-round-button"
                    accessibilityRole="button"
                    onPress={onDelete}
                    style={styles.roundDetail.deleteCard}
                >
                    <Text style={styles.roundDetail.deleteText}>Delete round</Text>
                </TouchableOpacity>
            )}

            {/* Edit mode: cancel/save */}
            {isEditing && !showSaveConfirm && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        testID="cancel-edit-button"
                        style={[styles.mediumButton, { backgroundColor: colours.red }]}
                        onPress={onCancelEdit}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="save-scorecard-button"
                        style={styles.mediumButton}
                        onPress={onSave}
                    >
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Save confirmation */}
            {showSaveConfirm && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        testID="cancel-save-button"
                        style={[styles.mediumButton, { backgroundColor: colours.red }]}
                        onPress={onCancelSave}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="confirm-save-button"
                        style={styles.mediumButton}
                        onPress={onConfirmSave}
                    >
                        <Text style={styles.buttonText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}
