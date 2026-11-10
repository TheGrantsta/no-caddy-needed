import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import EditRoundSheet from '../../components/EditRoundSheet';

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
        <EditRoundSheet courseName="Stats Flow Test Course" dateLabel="Tue 3 Nov 2026" holes={holes} total={12} {...handlers} {...overrides} />
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
});
