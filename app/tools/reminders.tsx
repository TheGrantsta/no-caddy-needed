import { useState, useEffect } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { useFakeRefresh } from '@/hooks/useFakeRefresh';
import { getPracticeRemindersService, addPracticeReminderService, deletePracticeReminderService, PracticeReminder } from '@/service/DbService';
import { schedulePracticeReminder, cancelPracticeReminder, upgradeOverdueRemindersService } from '../../service/NotificationService';
import ReminderList from '@/components/ReminderList';
import ReminderForm from '@/components/ReminderForm';

export default function Reminders() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const sortBySoonest = (list: PracticeReminder[]) =>
        [...list].sort((a, b) => new Date(a.ScheduledFor).getTime() - new Date(b.ScheduledFor).getTime());

    const [reminders, setReminders] = useState<PracticeReminder[]>(() => sortBySoonest(getPracticeRemindersService()));
    const [showAddForm, setShowAddForm] = useState(false);
    const [reminderLabel, setReminderLabel] = useState('');
    const [reminderDate, setReminderDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(12, 0, 0, 0);
        return d;
    });
    const [labelError, setLabelError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [swipedOpen, setSwipedOpen] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    const { refreshing, onRefresh } = useFakeRefresh(() => {
        loadReminders();
        setRefreshKey(prev => prev + 1);
        setSwipedOpen(new Set());
    });

    const loadReminders = () => {
        setReminders(sortBySoonest(getPracticeRemindersService()));
    };

    useEffect(() => {
        upgradeOverdueRemindersService().then(loadReminders);
    }, []);

    const handleSaveReminder = async () => {
        if (isSaving) return;
        if (!reminderLabel.trim()) {
            setLabelError('Reminder label is required');
            return;
        }
        setIsSaving(true);
        try {
            const scheduledDate = new Date(reminderDate);
            scheduledDate.setHours(9, 0, 0, 0);
            const notificationId = await schedulePracticeReminder(reminderLabel, scheduledDate);
            await addPracticeReminderService(reminderLabel, scheduledDate.toISOString(), notificationId);
            loadReminders();
            setShowAddForm(false);
            setReminderLabel('');
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            setReminderDate(tomorrow);
            setLabelError('');
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

                <ReminderList
                    reminders={reminders}
                    refreshKey={refreshKey}
                    onDeleteReminder={handleDeleteReminder}
                />

                <ReminderForm
                    reminderLabel={reminderLabel}
                    onReminderLabelChange={(text) => { setReminderLabel(text); if (labelError) setLabelError(''); }}
                    labelError={labelError}
                    reminderDate={reminderDate}
                    onReminderDateChange={setReminderDate}
                    isSaving={isSaving}
                    onSave={handleSaveReminder}
                    onCancel={() => {
                        setShowAddForm(false);
                        setReminderLabel('');
                        const t = new Date();
                        t.setDate(t.getDate() + 1);
                        t.setHours(12, 0, 0, 0);
                        setReminderDate(t);
                    }}
                    onShowForm={() => setShowAddForm(true)}
                    showForm={showAddForm}
                />
            </ScrollView>
        </GestureHandlerRootView>
    );
}
