import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AcknowledgeOverlay from '../../components/AcknowledgeOverlay';

jest.mock('../../hooks/useStyles', () => ({
    useStyles: () => require('../../assets/styles').default,
}));

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => require('../../assets/colours').default,
}));

describe('AcknowledgeOverlay', () => {
    it('rendersNothingWhenNotVisible', () => {
        const { queryByTestId } = render(
            <AcknowledgeOverlay visible={false} title="Pre-shot routine" text="Target, breathe, go" onDismiss={jest.fn()} />
        );

        expect(queryByTestId('acknowledge-overlay')).toBeNull();
    });

    it('rendersTitleTextAndGotItWithThumbsUpWhenVisible', () => {
        const { getByTestId, getByText } = render(
            <AcknowledgeOverlay visible title="What's new" text="Target, breathe, go" onDismiss={jest.fn()} />
        );

        expect(getByTestId('acknowledge-overlay')).toBeTruthy();
        expect(getByText("What's new")).toBeTruthy();
        expect(getByText('Target, breathe, go')).toBeTruthy();
        expect(getByText('Got it')).toBeTruthy();
        expect(getByTestId('acknowledge-dismiss')).toBeTruthy();
        expect(getByTestId('acknowledge-thumbs-up')).toBeTruthy();
    });

    it('centresTheTextByDefault', () => {
        const { getByText } = render(
            <AcknowledgeOverlay visible title="Notice" text="Body text" onDismiss={jest.fn()} />
        );

        const flat = StyleSheet.flatten(getByText('Body text').props.style);
        expect(flat.textAlign).toBe('center');
    });

    it('leftAlignsTheTextWhenTextAlignLeft', () => {
        const { getByText } = render(
            <AcknowledgeOverlay visible title="What's new" text="Body text" onDismiss={jest.fn()} textAlign="left" />
        );

        const flat = StyleSheet.flatten(getByText('Body text').props.style);
        expect(flat.textAlign).toBe('left');
    });

    it('callsOnDismissWhenGotItPressed', () => {
        const onDismiss = jest.fn();
        const { getByTestId } = render(
            <AcknowledgeOverlay visible title="Notice" text="Routine" onDismiss={onDismiss} />
        );

        fireEvent.press(getByTestId('acknowledge-dismiss'));

        expect(onDismiss).toHaveBeenCalled();
    });
});
