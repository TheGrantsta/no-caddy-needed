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
}

export default function ReminderList({
    reminders,
    refreshKey,
    onDeleteReminder,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    if (reminders.length === 0) {
        return (
            <View style={styles.contentSection}>
                <Text style={styles.normalText}>No reminders set</Text>
            </View>
        );
    }

    return (
        <>
            {reminders.map((reminder) => {
                const overdue = new Date(reminder.ScheduledFor) < new Date();
                return (
                    <View key={reminder.Id} style={{ marginHorizontal: 8, marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: overdue ? colours.red : colours.primary + '33', overflow: 'hidden' }}>
                        <ReanimatedSwipeable
                            key={refreshKey}
                            renderRightActions={() => (
                                <TouchableOpacity
                                    testID={`delete-reminder-${reminder.Id}`}
                                    onPress={() => onDeleteReminder(reminder)}
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
        </>
    );
}
