import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';

interface Props {
    isEditing: boolean;
    onDelete: () => void;
}

export default function ScorecardActionButtons({
    isEditing,
    onDelete,
}: Props) {
    const styles = useStyles();

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
        </>
    );
}
