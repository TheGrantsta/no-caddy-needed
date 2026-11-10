import React from 'react';
import { render, within } from '@testing-library/react-native';
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

const renderList = (reminders: object[]) =>
    render(
        <ReminderList
            reminders={reminders as any}
            refreshKey={0}
            onDeleteReminder={jest.fn()}
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

    it('shouldShowTheDateAndTimeWithoutANotificationToggle', () => {
        const { getByTestId, queryByTestId } = renderList([reminder()]);

        expect(within(getByTestId('reminder-detail-row-1')).getByText(/ · 09:05$/)).toBeTruthy();
        expect(queryByTestId('reminder-toggle-1')).toBeNull();
    });

    it('shouldShowAnOverdueReminderUnderTheOverdueLabel', () => {
        const { getByText, getByTestId } = renderList([reminder({ ScheduledFor: past })]);

        expect(getByText('OVERDUE')).toBeTruthy();
        expect(getByTestId('reminder-card-1')).toBeTruthy();
    });

    it('shouldNotShowAnOverdueLabelForUpcomingReminders', () => {
        const { queryByText } = renderList([reminder()]);

        expect(queryByText('OVERDUE')).toBeNull();
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

    describe('overdue grouping', () => {
        it('shouldListOverdueRemindersUnderAnOverdueLabelAboveTheUpcomingOnes', () => {
            const { getAllByText } = renderList([
                reminder({ Id: 1, Label: 'Old one', ScheduledFor: past }),
                reminder({ Id: 2, Label: 'New one', ScheduledFor: future }),
            ]);

            const headings = getAllByText(/^(OVERDUE|UPCOMING|Old one|New one)$/).map(el => el.props.children);
            expect(headings).toEqual(['OVERDUE', 'Old one', 'UPCOMING', 'New one']);
        });

        it('shouldNotShowAnOverdueLabelWhenNothingIsOverdue', () => {
            const { queryByText } = renderList([reminder({ ScheduledFor: future })]);

            expect(queryByText('OVERDUE')).toBeNull();
        });
    });

    it('shouldKeepTheSectionLabelCloseToItsReminders', () => {
        const { StyleSheet } = require('react-native');
        const { getByText } = renderList([reminder({ ScheduledFor: future })]);

        expect(StyleSheet.flatten(getByText('UPCOMING').props.style).marginBottom).toBeLessThanOrEqual(4);
    });
});
