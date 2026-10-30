import React from 'react';
import { render } from '@testing-library/react-native';
import ReminderList from '../../components/ReminderList';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
    const { View } = require('react-native');
    const MockSwipeable = ({ children }: any) => <View>{children}</View>;
    return { __esModule: true, default: MockSwipeable };
});

const future = '2099-06-15T09:00:00.000Z';

describe('ReminderList', () => {
    it('shouldShowTimeAlongsideTheDateForEachReminder', () => {
        const { getByText } = render(
            <ReminderList
                reminders={[{ Id: 1, Label: 'Chip', ScheduledFor: future, NotificationId: 'n1', Created_At: '2026-10-30T09:00:00.000Z' }]}
                refreshKey={0}
                onDeleteReminder={jest.fn()}
            />
        );

        const expectedTime = new Date(future).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        expect(getByText(new RegExp(expectedTime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeTruthy();
    });

    it('shouldFlagRemindersSavedWithoutNotifications', () => {
        const { getByText } = render(
            <ReminderList
                reminders={[{ Id: 2, Label: 'Chip', ScheduledFor: future, NotificationId: null, Created_At: '2026-10-30T09:00:00.000Z' }]}
                refreshKey={0}
                onDeleteReminder={jest.fn()}
            />
        );

        expect(getByText('Notifications off')).toBeTruthy();
    });

    it('shouldNotFlagRemindersThatHaveNotifications', () => {
        const { queryByText } = render(
            <ReminderList
                reminders={[{ Id: 3, Label: 'Chip', ScheduledFor: future, NotificationId: 'n3', Created_At: '2026-10-30T09:00:00.000Z' }]}
                refreshKey={0}
                onDeleteReminder={jest.fn()}
            />
        );

        expect(queryByText('Notifications off')).toBeNull();
    });

    it('shouldHintThatRemindersCanBeSwipedToDelete', () => {
        const { getByText } = render(
            <ReminderList
                reminders={[{ Id: 4, Label: 'Chip', ScheduledFor: future, NotificationId: 'n4', Created_At: '2026-10-30T09:00:00.000Z' }]}
                refreshKey={0}
                onDeleteReminder={jest.fn()}
            />
        );

        expect(getByText('Swipe left to delete')).toBeTruthy();
    });
});
