import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
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
    const [reminderDate, setReminderDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(12, 0, 0, 0);
        return d;
    });
    const [labelError, setLabelError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [swipedOpen, setSwipedOpen] = useState<Set<number>>(new Set());

    const loadReminders = () => {
        setReminders(getPracticeRemindersService());
    };

    const handleSaveReminder = async () => {
        if (!reminderLabel.trim()) {
            setLabelError('Reminder label is required');
            return;
        }
        const notificationId = await schedulePracticeReminder(reminderLabel, reminderDate);
        await addPracticeReminderService(reminderLabel, reminderDate.toISOString(), notificationId);
        loadReminders();
        setShowAddForm(false);
        setReminderLabel('');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        setReminderDate(tomorrow);
        setLabelError('');
    };

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            loadReminders();
            setRefreshKey(prev => prev + 1);
            setSwipedOpen(new Set());
            setRefreshing(false);
        }, 750);
    };

    const handleDeleteReminder = async (reminder: PracticeReminder) => {
        await cancelPracticeReminder(reminder.NotificationId);
        await deletePracticeReminderService(reminder.Id);
        loadReminders();
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {refreshing && (
                <View style={styles.updateOverlay}>
                    <Text style={styles.updateText}>Release to update</Text>
                </View>
            )}
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colours.primary} />
            }>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>
                        Practice reminders
                    </Text>
                </View>

                <View style={styles.divider} />

                {reminders.length === 0 && !showAddForm && (
                    <View style={styles.contentSection}>
                        <Text style={styles.normalText}>No reminders set</Text>
                    </View>
                )}

                {reminders.map((reminder) => {
                    const overdue = new Date(reminder.ScheduledFor) < new Date();
                    return (
                        <View key={reminder.Id} style={{ marginHorizontal: 8, marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: overdue ? colours.red : colours.primary + '33', overflow: 'hidden' }}>
                            <ReanimatedSwipeable
                                key={refreshKey}
                                onSwipeableWillOpen={() => setSwipedOpen(prev => new Set(prev).add(reminder.Id))}
                                onSwipeableClose={() => setSwipedOpen(prev => { const next = new Set(prev); next.delete(reminder.Id); return next; })}
                                renderRightActions={() => (
                                    <TouchableOpacity
                                        testID={`delete-reminder-${reminder.Id}`}
                                        onPress={() => handleDeleteReminder(reminder)}
                                        style={{ backgroundColor: colours.red, justifyContent: 'center', alignItems: 'center', width: 80 }}
                                    >
                                        <MaterialIcons name="delete-outline" size={24} color={colours.white} />
                                        <Text style={{ color: colours.white, fontSize: 12 }}>Delete</Text>
                                    </TouchableOpacity>
                                )}
                            >
                                <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Text style={styles.normalText}>{reminder.Label}</Text>
                                        <Text style={[styles.normalText, { color: overdue ? colours.red : colours.text }]}>{new Date(reminder.ScheduledFor).toLocaleDateString()}</Text>
                                        {overdue && <Text style={{ color: colours.red, fontSize: 12, fontWeight: 'bold' }}>Overdue</Text>}
                                    </View>
                                </View>
                            </ReanimatedSwipeable>
                        </View>
                    );
                })}

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
                            style={[styles.textInput, labelError ? styles.textInputError : null]}
                            placeholder="Reminder label"
                            placeholderTextColor={colours.tertiary}
                            value={reminderLabel}
                            onChangeText={(text) => { setReminderLabel(text); if (labelError) setLabelError(''); }}
                        />
                        {labelError ? <Text style={styles.errorText}>{labelError}</Text> : null}
                        <View style={[styles.titleRow, styles.marginTop]}>
                            <Text style={styles.textLabel}>Date</Text>
                            <DateTimePicker
                                testID="reminder-date-picker"
                                value={reminderDate}
                                mode="date"
                                display="default"
                                onChange={(_: any, date?: Date) => {
                                    if (date) setReminderDate(date);
                                }}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => { setShowAddForm(false); setReminderLabel(''); const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(12, 0, 0, 0); setReminderDate(t); }} style={[styles.mediumButton, { backgroundColor: colours.red }]}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity testID="save-reminder-button" onPress={handleSaveReminder} style={styles.mediumButton}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}
