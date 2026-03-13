import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { getPracticeRemindersService, addPracticeReminderService, deletePracticeReminderService, PracticeReminder } from '@/service/DbService';
import { schedulePracticeReminder, cancelPracticeReminder } from '../../service/NotificationService';

export default function Reminders() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const [reminders, setReminders] = useState<PracticeReminder[]>(() => getPracticeRemindersService());
    const [showAddForm, setShowAddForm] = useState(false);
    const [reminderLabel, setReminderLabel] = useState('');
    const [reminderDate, setReminderDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const loadReminders = () => {
        setReminders(getPracticeRemindersService());
    };

    const handleSaveReminder = async () => {
        const notificationId = await schedulePracticeReminder(reminderLabel, reminderDate);
        await addPracticeReminderService(reminderLabel, reminderDate.toISOString(), notificationId);
        loadReminders();
        setShowAddForm(false);
        setReminderLabel('');
        setReminderDate(new Date());
    };

    const handleDeleteReminder = async (reminder: PracticeReminder) => {
        await cancelPracticeReminder(reminder.NotificationId);
        await deletePracticeReminderService(reminder.Id);
        loadReminders();
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>
                        Practice reminders
                    </Text>
                </View>

                <View style={styles.divider} />

                {reminders.length === 0 && !showAddForm && (
                    <Text style={styles.normalText}>No reminders yet</Text>
                )}

                {reminders.map((reminder) => (
                    <View key={reminder.Id} style={[styles.contentSection, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <View>
                            <Text style={styles.normalText}>{reminder.Label}</Text>
                            <Text style={styles.normalText}>{new Date(reminder.ScheduledFor).toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity testID={`delete-reminder-${reminder.Id}`} onPress={() => handleDeleteReminder(reminder)}>
                            <MaterialIcons name="delete-outline" size={24} color={colours.errorText} />
                        </TouchableOpacity>
                    </View>
                ))}

                {!showAddForm && (
                    <View style={styles.headerContainer}>
                        <TouchableOpacity testID="add-reminder-button" onPress={() => setShowAddForm(true)} style={styles.largeButton}>
                            <Text style={styles.buttonText}>Add reminder</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showAddForm && (
                    <View style={styles.contentSection}>
                        <TextInput
                            testID="reminder-label-input"
                            style={styles.input}
                            placeholder="Reminder label"
                            placeholderTextColor={colours.tertiary}
                            value={reminderLabel}
                            onChangeText={setReminderLabel}
                        />
                        <TouchableOpacity testID="reminder-date-button" onPress={() => setShowDatePicker(true)} style={styles.button}>
                            <Text style={styles.buttonText}>{reminderDate.toLocaleString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={reminderDate}
                                mode="datetime"
                                onChange={(_: any, date?: Date) => {
                                    setShowDatePicker(false);
                                    if (date) setReminderDate(date);
                                }}
                            />
                        )}
                        <TouchableOpacity testID="save-reminder-button" onPress={handleSaveReminder} style={styles.button}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setShowAddForm(false); setReminderLabel(''); setReminderDate(new Date()); }} style={styles.button}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}
