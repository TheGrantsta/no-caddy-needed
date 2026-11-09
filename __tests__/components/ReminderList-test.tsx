import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
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

const future = new Date(2099, 5, 15, 9, 5).toISOString();
const past = new Date(2001, 0, 1, 9, 0).toISOString();
const reminder = (overrides: object = {}) => ({
    Id: 1,
    Label: 'Chip',
    ScheduledFor: future,
    NotificationId: 'n1',
    Created_At: '2026-10-30T09:00:00.000Z',
    ...overrides,
});

const renderList = (reminders: object[], onToggleReminder = jest.fn()) =>
    render(
        <ReminderList
            reminders={reminders as any}
            refreshKey={0}
            onDeleteReminder={jest.fn()}
            onToggleReminder={onToggleReminder}
        />
    );

describe('ReminderList', () => {
    it('shouldShowTheUpcomingLabelAboveReminders', () => {
        const { getByText } = renderList([reminder()]);

        expect(getByText('UPCOMING')).toBeTruthy();
    });

    it('shouldShowTheTimeIn24HourFormat', () => {
        const { getByText } = renderList([reminder()]);

        expect(getByText(/09:05/)).toBeTruthy();
    });

    it('shouldShowTheLabelAsTheMainTextWithTheTimeAndDateBelowIt', () => {
        const { getByTestId, getByText } = renderList([reminder()]);
        const fontSizes = require('../../assets/font-sizes').default;

        expect(getByTestId('reminder-label-1')).toHaveStyle({ fontSize: fontSizes.subHeader, fontWeight: 'bold' });
        expect(getByText(/ · 09:05$/)).toHaveStyle({ fontSize: fontSizes.normal });

        expect(getByTestId('reminder-label-1')).toHaveTextContent('Chip');
        expect(getByText(/ · 09:05$/)).toBeTruthy();
    });

    it('stacksTheLabelAboveARowOfDateAndTimeWithTheSwitch', () => {
        const { getByTestId } = renderList([reminder()]);

        expect(getByTestId('reminder-card-1')).toHaveStyle({ flexDirection: 'column' });
    });

    it('shouldPutTheSwitchOnTheSameRowAsTheTimeAndDate', () => {
        const { getByTestId } = renderList([reminder()]);

        const row = getByTestId('reminder-detail-row-1');
        expect(within(row).getByTestId('reminder-toggle-1')).toBeTruthy();
        expect(within(row).getByText(/ · 09:05$/)).toBeTruthy();
    });

    it('shouldShowASwitchOnForRemindersWithANotification', () => {
        const { getByTestId } = renderList([reminder()]);

        expect(getByTestId('reminder-toggle-1').props.value).toBe(true);
    });

    it('shouldShowASwitchOffForRemindersWithoutANotification', () => {
        const { getByTestId } = renderList([reminder({ Id: 2, NotificationId: null })]);

        expect(getByTestId('reminder-toggle-2').props.value).toBe(false);
    });

    it('shouldReportTheNewStateWhenTheSwitchIsChanged', () => {
        const onToggleReminder = jest.fn();
        const item = reminder();
        const { getByTestId } = renderList([item], onToggleReminder);

        fireEvent(getByTestId('reminder-toggle-1'), 'valueChange', false);

        expect(onToggleReminder).toHaveBeenCalledWith(item, false);
    });

    it('shouldMarkRemindersThatAreOverdue', () => {
        const { getByText } = renderList([reminder({ ScheduledFor: past })]);

        expect(getByText('Overdue')).toBeTruthy();
    });

    it('shouldNotMarkUpcomingRemindersAsOverdue', () => {
        const { queryByText } = renderList([reminder()]);

        expect(queryByText('Overdue')).toBeNull();
    });

    it('shouldHintThatRemindersCanBeSwipedToDelete', () => {
        const { getByText } = renderList([reminder()]);

        expect(getByText('Swipe left on a reminder to delete it.')).toBeTruthy();
    });

    it('shouldShowNoRemindersMessageWhenTheListIsEmpty', () => {
        const { getByText, queryByText } = renderList([]);

        expect(getByText('No reminders set')).toBeTruthy();
        expect(queryByText('UPCOMING')).toBeNull();
    });
});
