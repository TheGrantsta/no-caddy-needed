import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    visible: boolean;
    holeNumber: number;
    // True when the hole is the round's only one, so deleting it also deletes the round
    deletesRound: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// Confirms before the last hole of an unfinished round is deleted, in the same style as the round delete sheet
const DeleteHoleSheet = ({ visible, holeNumber, deletesRound, onConfirm, onCancel }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.endRoundSheet;

    if (!visible) return null;

    const message = deletesRound
        ? 'This is the only hole, so the round will be deleted too. This can’t be undone.'
        : 'Its scores and stats will be removed. This can’t be undone.';

    return (
        <Modal transparent animationType="slide" visible onRequestClose={onCancel}>
            <TouchableOpacity activeOpacity={1} onPress={onCancel} style={s.backdrop} />
            <View testID="delete-hole-sheet" style={s.sheetContainer}>
                <View style={s.group}>
                    <View style={s.header}>
                        <Text style={s.title}>{`Delete hole ${holeNumber}?`}</Text>
                        <Text style={s.message}>{message}</Text>
                    </View>
                    <View style={s.divider} />
                    <TouchableOpacity testID="confirm-delete-hole-button" onPress={onConfirm} style={s.action}>
                        <Text style={[s.actionText, { color: colours.red }]}>Delete hole</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity testID="delete-hole-cancel-button" onPress={onCancel} style={s.cancelPill}>
                    <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default DeleteHoleSheet;
