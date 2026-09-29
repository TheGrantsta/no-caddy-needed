import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CtaButton from './CtaButton';
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
    onShowForm: () => void;
    showForm: boolean;
}

export default function ReminderForm({
    reminderLabel,
    onReminderLabelChange,
    labelError,
    reminderDate,
    onReminderDateChange,
    isSaving,
    onSave,
    onCancel,
    onShowForm,
    showForm,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    if (!showForm) {
        return (
            <View style={[styles.headerContainer, { marginHorizontal: 8, marginTop: 20 }]}>
                <CtaButton
                    testID="add-reminder-button"
                    label="Add reminder"
                    icon="add-alarm"
                    onPress={onShowForm}
                />
            </View>
        );
    }

    return (
        <View style={styles.contentSection}>
            <TextInput
                testID="reminder-label-input"
                style={[styles.textInput, labelError ? styles.textInputError : null]}
                placeholder="Reminder label"
                placeholderTextColor={colours.tertiary}
                value={reminderLabel}
                onChangeText={onReminderLabelChange}
            />
            {labelError ? <Text style={styles.errorText}>{labelError}</Text> : null}
            <View style={[styles.titleRow, styles.marginTop]}>
                <Text style={styles.textLabel}>Date</Text>
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
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={onCancel}
                    style={[styles.mediumButton, { backgroundColor: colours.red }]}
                    disabled={isSaving}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="save-reminder-button"
                    onPress={onSave}
                    style={styles.mediumButton}
                    disabled={isSaving}
                >
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
