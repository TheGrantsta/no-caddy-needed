import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

interface Props {
    reminderLabel: string;
    onReminderLabelChange: (text: string) => void;
    labelError: string;
    reminderDate: Date;
    onReminderDateChange: (date: Date) => void;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
    showForm: boolean;
}

// New-reminder card, opened from the + button in the page header
export default function ReminderForm({
    reminderLabel,
    onReminderLabelChange,
    labelError,
    reminderDate,
    onReminderDateChange,
    isSaving,
    onSave,
    onCancel,
    showForm,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.reminderForm;

    if (!showForm) {
        return null;
    }

    return (
        <View testID="reminder-form-card" style={s.card}>
            <TextInput
                testID="reminder-label-input"
                style={[s.labelInput, labelError ? s.labelInputError : null]}
                placeholder="Reminder label"
                placeholderTextColor={colours.tertiary}
                value={reminderLabel}
                onChangeText={onReminderLabelChange}
            />
            {labelError ? <Text testID="reminder-label-error" style={s.errorText}>{labelError}</Text> : null}
            <View style={s.dateRow}>
                <Text style={s.dateLabel}>Date</Text>
                <DateTimePicker
                    testID="reminder-date-picker"
                    value={reminderDate}
                    mode="date"
                    display="default"
                    minimumDate={(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })()}
                    onChange={(_: any, date?: Date) => {
                        if (date) onReminderDateChange(date);
                    }}
                />
            </View>
            <View style={s.buttonRow}>
                <TouchableOpacity
                    testID="cancel-reminder-button"
                    accessibilityRole="button"
                    onPress={onCancel}
                    disabled={isSaving}
                    style={s.cancelButton}
                >
                    <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="save-reminder-button"
                    accessibilityRole="button"
                    onPress={onSave}
                    disabled={isSaving}
                    style={s.saveButton}
                >
                    <Text style={s.saveText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
