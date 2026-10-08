import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CtaButton from './CtaButton';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    isEditing: boolean;
    showSaveConfirm: boolean;
    showDeleteConfirm: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onCancelEdit: () => void;
    onSave: () => void;
    onCancelSave: () => void;
    onConfirmSave: () => void;
    onCancelDelete: () => void;
    onConfirmDelete: () => void;
}

export default function ScorecardActionButtons({
    isEditing,
    showSaveConfirm,
    showDeleteConfirm,
    onEdit,
    onDelete,
    onCancelEdit,
    onSave,
    onCancelSave,
    onConfirmSave,
    onCancelDelete,
    onConfirmDelete,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <>
            {/* Spacer fills gap when not editing/deleting */}
            {!isEditing && !showDeleteConfirm && <View style={{ flexGrow: 1 }} />}

            {/* Edit button */}
            {!isEditing && !showDeleteConfirm && (
                <View style={[styles.headerContainer, { paddingHorizontal: 16 }]}>
                    <CtaButton
                        testID="edit-scorecard-button"
                        label="Edit"
                        icon="edit"
                        onPress={onEdit}
                    />
                </View>
            )}

            {/* Delete button */}
            {!isEditing && !showDeleteConfirm && (
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        testID="delete-round-button"
                        style={styles.tertiaryLink}
                        onPress={onDelete}
                    >
                        <MaterialIcons name="delete-outline" size={20} color={colours.red} />
                        <Text style={styles.tertiaryLinkText}>Delete round</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Delete confirmation */}
            {!isEditing && showDeleteConfirm && (
                <View style={{ gap: 16 }}>
                    <View style={{ alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.headerText]}>Delete round?</Text>
                        <Text style={[styles.subHeaderText, { color: colours.text }]}>This cannot be undone</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            testID="cancel-delete-button"
                            onPress={onCancelDelete}
                            style={styles.mediumButton}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="confirm-delete-button"
                            onPress={onConfirmDelete}
                            style={[styles.mediumButton, { backgroundColor: colours.red }]}
                        >
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
                        style={styles.mediumButton}
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
