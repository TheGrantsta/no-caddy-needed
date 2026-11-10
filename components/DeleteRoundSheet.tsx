import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// Confirms before a saved round is deleted: explains what goes, offers Delete round, and a Cancel
const DeleteRoundSheet = ({ visible, onConfirm, onCancel }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.endRoundSheet;

    if (!visible) return null;

    return (
        <Modal transparent animationType="slide" visible onRequestClose={onCancel}>
            <TouchableOpacity activeOpacity={1} onPress={onCancel} style={s.backdrop} />
            <View testID="delete-round-sheet" style={s.sheetContainer}>
                <View style={s.group}>
                    <View style={s.header}>
                        <Text style={s.title}>Delete this round?</Text>
                        <Text style={s.message}>Its scores and stats will be removed from Stats. This can’t be undone.</Text>
                    </View>
                    <View style={s.divider} />
                    <TouchableOpacity testID="confirm-delete-button" onPress={onConfirm} style={s.action}>
                        <Text style={[s.actionText, { color: colours.red }]}>Delete round</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity testID="cancel-delete-button" onPress={onCancel} style={s.keepPlaying}>
                    <Text style={[s.actionText, { color: colours.primary, fontWeight: '700' }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default DeleteRoundSheet;
