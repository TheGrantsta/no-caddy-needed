import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HoleNoteInput from '../../components/HoleNoteInput';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
    useTheme: () => ({
        theme: 'dark',
        colours: require('../../assets/colours').default,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
    }),
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: 'MaterialIcons',
}));

describe('HoleNoteInput', () => {
    const mockOnNoteChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('when note is empty', () => {
        it('showsAddNoteButtonWhenNoteIsEmpty', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="" onNoteChange={mockOnNoteChange} />
            );
            expect(getByTestId('add-note-button')).toBeTruthy();
        });

        it('doesNotShowTextInputInitiallyWhenNoteIsEmpty', () => {
            const { queryByTestId } = render(
                <HoleNoteInput note="" onNoteChange={mockOnNoteChange} />
            );
            expect(queryByTestId('hole-note-input')).toBeNull();
        });

        it('showsTextInputAfterAddNoteIsPressed', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="" onNoteChange={mockOnNoteChange} />
            );
            fireEvent.press(getByTestId('add-note-button'));
            expect(getByTestId('hole-note-input')).toBeTruthy();
        });

        it('hidesAddNoteButtonAfterItIsPressed', () => {
            const { getByTestId, queryByTestId } = render(
                <HoleNoteInput note="" onNoteChange={mockOnNoteChange} />
            );
            fireEvent.press(getByTestId('add-note-button'));
            expect(queryByTestId('add-note-button')).toBeNull();
        });

        it('callsOnNoteChangeWhenTypingAfterAddNotePressed', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="" onNoteChange={mockOnNoteChange} />
            );
            fireEvent.press(getByTestId('add-note-button'));
            fireEvent.changeText(getByTestId('hole-note-input'), 'new note');
            expect(mockOnNoteChange).toHaveBeenCalledWith('new note');
        });
    });

    describe('when note exists', () => {
        it('showsNoteTextWhenNoteExistsAndNotEditing', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="aim left of bunker" onNoteChange={mockOnNoteChange} />
            );
            expect(getByTestId('hole-note-text')).toBeTruthy();
        });

        it('displaysNoteContentInNoteText', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="aim left of bunker" onNoteChange={mockOnNoteChange} />
            );
            expect(getByTestId('hole-note-text')).toHaveTextContent('aim left of bunker');
        });

        it('doesNotShowTextInputWhenNoteExistsAndNotEditing', () => {
            const { queryByTestId } = render(
                <HoleNoteInput note="aim left of bunker" onNoteChange={mockOnNoteChange} />
            );
            expect(queryByTestId('hole-note-input')).toBeNull();
        });

        it('showsEditButtonWhenNoteExists', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="aim left of bunker" onNoteChange={mockOnNoteChange} />
            );
            expect(getByTestId('edit-note-button')).toBeTruthy();
        });

        it('showsTextInputAfterEditNoteIsPressed', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="aim left of bunker" onNoteChange={mockOnNoteChange} />
            );
            fireEvent.press(getByTestId('edit-note-button'));
            expect(getByTestId('hole-note-input')).toBeTruthy();
        });

        it('prePopulatesTextInputWithExistingNoteWhenEditing', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="aim left of bunker" onNoteChange={mockOnNoteChange} />
            );
            fireEvent.press(getByTestId('edit-note-button'));
            expect(getByTestId('hole-note-input').props.value).toBe('aim left of bunker');
        });

        it('callsOnNoteChangeWhenTypingAfterEditNotePressed', () => {
            const { getByTestId } = render(
                <HoleNoteInput note="aim left of bunker" onNoteChange={mockOnNoteChange} />
            );
            fireEvent.press(getByTestId('edit-note-button'));
            fireEvent.changeText(getByTestId('hole-note-input'), 'updated note');
            expect(mockOnNoteChange).toHaveBeenCalledWith('updated note');
        });
    });
});
