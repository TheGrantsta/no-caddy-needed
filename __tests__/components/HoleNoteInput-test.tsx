import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import HoleNoteInput from '../../components/HoleNoteInput';

jest.mock('@/context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

jest.mock('@/hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

describe('HoleNoteInput', () => {
    it('shouldShowAMultilineNoteFieldAlwaysVisible', () => {
        const { getByTestId } = render(<HoleNoteInput note="" onNoteChange={jest.fn()} />);

        expect(getByTestId('hole-note-input').props.multiline).toBe(true);
    });

    it('shouldShowTheNotesPlaceholderLikeTheMockup', () => {
        const { getByTestId } = render(<HoleNoteInput note="" onNoteChange={jest.fn()} />);

        expect(getByTestId('hole-note-input').props.placeholder).toBe('e.g. Driver off the tee');
    });

    it('shouldShowTheSavedNoteInTheField', () => {
        const { getByTestId } = render(<HoleNoteInput note="aim left" onNoteChange={jest.fn()} />);

        expect(getByTestId('hole-note-input').props.value).toBe('aim left');
    });

    it('shouldCallOnNoteChangeWhenTyping', () => {
        const onNoteChange = jest.fn();
        const { getByTestId } = render(<HoleNoteInput note="" onNoteChange={onNoteChange} />);

        fireEvent.changeText(getByTestId('hole-note-input'), 'driver');

        expect(onNoteChange).toHaveBeenCalledWith('driver');
    });

    it('shouldNotShowAddNoteOrEditNoteButtons', () => {
        const { queryByTestId, queryByText } = render(<HoleNoteInput note="aim left" onNoteChange={jest.fn()} />);

        expect(queryByTestId('add-note-button')).toBeNull();
        expect(queryByTestId('edit-note-button')).toBeNull();
        expect(queryByText('Add note')).toBeNull();
    });

    it('shouldGiveTheFieldAWhiteRoundedCardWithRoomForAFewLines', () => {
        const { getByTestId } = render(<HoleNoteInput note="" onNoteChange={jest.fn()} />);
        const style = StyleSheet.flatten(getByTestId('hole-note-input').props.style);

        expect(style.backgroundColor).toBe(require('../../assets/colours').default.backgroundLight);
        expect(style.borderRadius).toBeGreaterThanOrEqual(14);
        expect(style.minHeight).toBeGreaterThanOrEqual(120);
    });
});
