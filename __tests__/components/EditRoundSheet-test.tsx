import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import EditRoundSheet from '../../components/EditRoundSheet';

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

const holes = [
    { holeNumber: 1, par: 4, score: 4, putts: 1, sins: 1 },
    { holeNumber: 2, par: 4, score: 4, putts: 2, sins: 0 },
    { holeNumber: 3, par: 4, score: 4, putts: 3, sins: 1 },
];

const renderSheet = (overrides: object = {}) => {
    const handlers = { onHolePress: jest.fn(), onCancel: jest.fn(), onSave: jest.fn() };
    const utils = render(
        <EditRoundSheet
            courseName="Stats Flow Test Course"
            dateLabel="Tue 3 Nov 2026"
            dateValue={new Date(2026, 10, 3, 10, 0)}
            onDateChange={jest.fn()}
            maximumDate={new Date(2026, 10, 11, 23, 59, 59)}
            holes={holes}
            total={12}
            {...handlers}
            {...overrides}
        />
    );
    return { ...utils, ...handlers };
};

describe('EditRoundSheet', () => {
    it('shouldShowCancelTheEditRoundTitleAndSaveInTheHeader', () => {
        const { getByText, getByTestId } = renderSheet();

        expect(getByText('Edit round')).toBeTruthy();
        expect(getByTestId('cancel-edit-button')).toBeTruthy();
        expect(getByTestId('save-scorecard-button')).toBeTruthy();
    });

    it('shouldReportCancelAndSave', () => {
        const { getByTestId, onCancel, onSave } = renderSheet();

        fireEvent.press(getByTestId('cancel-edit-button'));
        fireEvent.press(getByTestId('save-scorecard-button'));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('shouldShowTheCourseAndDate', () => {
        const { getByText } = renderSheet();

        expect(getByText('Stats Flow Test Course')).toBeTruthy();
        expect(getByText('Tue 3 Nov 2026')).toBeTruthy();
    });

    it('shouldListEachHoleWithParPuttsSinsAndScore', () => {
        const { getByTestId, getByText } = renderSheet();

        expect(getByTestId('edit-round-hole-1')).toBeTruthy();
        expect(getByText('1 putt · 1 sin')).toBeTruthy();
        expect(getByText('2 putts')).toBeTruthy();
        expect(getByText('3 putts · 1 sin')).toBeTruthy();
    });

    it('shouldShowTheRoundTotal', () => {
        const { getByText } = renderSheet();

        expect(getByText('Total 12')).toBeTruthy();
    });

    it('shouldOpenTheHoleWhenItsRowIsPressed', () => {
        const { getByTestId, onHolePress } = renderSheet();

        fireEvent.press(getByTestId('edit-round-hole-2'));

        expect(onHolePress).toHaveBeenCalledWith(2);
    });

    it('shouldOpenADatePickerWithTheRoundDateWhenTheDateRowIsPressed', () => {
        const { getByTestId, queryByTestId } = renderSheet();
        expect(queryByTestId('edit-round-date-picker')).toBeNull();

        fireEvent.press(getByTestId('edit-round-date'));

        expect(getByTestId('edit-round-date-picker').props.value).toEqual(new Date(2026, 10, 3, 10, 0));
    });

    it('shouldReportTheDateChosenInThePicker', () => {
        const onDateChange = jest.fn();
        const { getByTestId } = renderSheet({ onDateChange });
        fireEvent.press(getByTestId('edit-round-date'));
        const chosen = new Date(2026, 10, 9, 10, 0);

        fireEvent(getByTestId('edit-round-date-picker'), 'change', {}, chosen);

        expect(onDateChange).toHaveBeenCalledWith(chosen);
    });

    it('shouldStopThePickerAtTheMaximumDateSoFutureDatesCannotBeChosen', () => {
        const maximumDate = new Date(2026, 10, 11, 23, 59, 59);
        const { getByTestId } = renderSheet({ maximumDate });
        fireEvent.press(getByTestId('edit-round-date'));

        expect(getByTestId('edit-round-date-picker')).toHaveProp('maximumDate', maximumDate);
    });
});
