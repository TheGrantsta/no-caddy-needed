import { useState, useEffect, useCallback } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { useFakeRefresh } from '@/hooks/useFakeRefresh';
import { useForm } from '../../hooks/useForm';
import { useToggle } from '../../hooks/useToggle';
import { validateNonEmpty } from '../../assets/validation';
import { getPracticeRemindersService, addPracticeReminderService, deletePracticeReminderService, PracticeReminder } from '@/service/DbService';
import { schedulePracticeReminder, cancelPracticeReminder, upgradeOverdueRemindersService, ensureNotificationPermission } from '../../service/NotificationService';
import ReminderList from '@/components/ReminderList';
import ReminderForm from '@/components/ReminderForm';
import PageHeader from '@/components/PageHeader';

export default function Reminders() {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const { landscapePadding } = useOrientation();
    const sortBySoonest = (list: PracticeReminder[]) =>
        [...list].sort((a, b) => new Date(a.ScheduledFor).getTime() - new Date(b.ScheduledFor).getTime());

    const [reminders, setReminders] = useState<PracticeReminder[]>(() => sortBySoonest(getPracticeRemindersService()));
    const [showAddForm, toggleAddForm] = useToggle(false);
    const [formState, resetForm] = useForm({ label: '' });
    const [reminderDate, setReminderDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        return d;
    });
    const [refreshKey, setRefreshKey] = useState(0);
    const [, setSwipedOpen] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    const loadReminders = useCallback(() => {
        setReminders(sortBySoonest(getPracticeRemindersService()));
    }, []);

    const { refreshing, onRefresh } = useFakeRefresh(() => {
        loadReminders();
        setRefreshKey(prev => prev + 1);
        setSwipedOpen(new Set());
    });

    useEffect(() => {
        upgradeOverdueRemindersService().then(loadReminders);
    }, [loadReminders]);

    // Turning a reminder on schedules its notification; turning it off cancels the notification
    const handleSaveReminder = async () => {
        if (isSaving) return;

        const labelError = validateNonEmpty(formState.label.value, 'Reminder label');
        if (labelError) {
            formState.label.setError(labelError);
            return;
        }

        setIsSaving(true);
        try {
            const scheduledDate = new Date(reminderDate);
            scheduledDate.setHours(9, 0, 0, 0);
            // Permission is requested here, on the first reminder, rather than at app launch
            const allowed = await ensureNotificationPermission();
            const notificationId = allowed ? await schedulePracticeReminder(formState.label.value, scheduledDate) : null;
            await addPracticeReminderService(formState.label.value, scheduledDate.toISOString(), notificationId);
            loadReminders();
            toggleAddForm(false);
            resetForm();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            setReminderDate(tomorrow);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteReminder = async (reminder: PracticeReminder) => {
        await cancelPracticeReminder(reminder.NotificationId);
        await deletePracticeReminderService(reminder.Id);
        loadReminders();
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colours.primary} />
            }>
                <PageHeader
                    title="Reminders"
                    onBack={() => router.back()}
                    rightAction={
                        <TouchableOpacity
                            testID="add-reminder-button"
                            accessibilityRole="button"
                            accessibilityLabel="Add reminder"
                            onPress={() => toggleAddForm(true)}
                            style={styles.pageHeader.circleButton}
                        >
                            <Ionicons name="add" size={34} color={colours.primary} />
                        </TouchableOpacity>
                    }
                />

                <ReminderList
                    reminders={reminders}
                    refreshKey={refreshKey}
                    onDeleteReminder={handleDeleteReminder}
                />

                <ReminderForm
                    reminderLabel={formState.label.value}
                    onReminderLabelChange={formState.label.onChange}
                    labelError={formState.label.error}
                    reminderDate={reminderDate}
                    onReminderDateChange={setReminderDate}
                    isSaving={isSaving}
                    onSave={handleSaveReminder}
                    onCancel={() => {
                        toggleAddForm(false);
                        resetForm();
                        const t = new Date();
                        t.setDate(t.getDate() + 1);
                        t.setHours(12, 0, 0, 0);
                        setReminderDate(t);
                    }}
                    showForm={showAddForm}
                />
            </ScrollView>
        </GestureHandlerRootView>
    );
}
