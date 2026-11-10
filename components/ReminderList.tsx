import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { PracticeReminder } from '@/service/DbService';

interface Props {
    reminders: PracticeReminder[];
    refreshKey: number;
    onDeleteReminder: (reminder: PracticeReminder) => void;
    // Called with the reminder and whether its notification should now be on
}

const pad = (n: number) => String(n).padStart(2, '0');

// Reminders as cards: 24-hour time, label and date, and a switch for the reminder's notification
export default function ReminderList({
    reminders,
    refreshKey,
    onDeleteReminder,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.reminderCards;

    if (reminders.length === 0) {
        return (
            <View>
                <View style={styles.divider} />
                <Text style={styles.normalText}>No reminders set</Text>
            </View>
        );
    }

    return (
        <>
            <Text style={s.sectionLabel}>UPCOMING</Text>
            {reminders.map((reminder) => {
                const scheduled = new Date(reminder.ScheduledFor);
                const overdue = scheduled < new Date();
                const time = `${pad(scheduled.getHours())}:${pad(scheduled.getMinutes())}`;
                const date = scheduled.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                return (
                    <View key={reminder.Id} style={s.cardWrap}>
                        <ReanimatedSwipeable
                            key={refreshKey}
                            renderRightActions={() => (
                                <TouchableOpacity
                                    testID={`delete-reminder-${reminder.Id}`}
                                    onPress={() => onDeleteReminder(reminder)}
                                    style={s.deleteAction}
                                >
                                    <MaterialIcons name="delete-outline" size={24} color={colours.white} />
                                    <Text style={s.deleteText}>Delete</Text>
                                </TouchableOpacity>
                            )}
                        >
                            <View testID={`reminder-card-${reminder.Id}`} style={s.card}>
                                <Text testID={`reminder-label-${reminder.Id}`} style={s.label}>{reminder.Label}</Text>
                                <View testID={`reminder-detail-row-${reminder.Id}`} style={s.detailRow}>
                                    <Text style={s.detail}>{`${date} · ${time}`}</Text>
                                </View>
                                {overdue && <Text style={s.overdue}>Overdue</Text>}
                            </View>
                        </ReanimatedSwipeable>
                    </View>
                );
            })}
            <Text style={s.hint}>Swipe left on a reminder to delete it.</Text>
        </>
    );
}
