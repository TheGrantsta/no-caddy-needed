import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import SettingsToggleRow from '../../components/SettingsToggleRow';

jest.mock('../../context/ThemeContext', () => ({
    useThemeColours: () => ({
        primary: '#2D5A3D',
        background: '#25292e',
    }),
}));

const voiceOptions = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
    { label: 'Neutral', value: 'neutral' },
];

describe('SettingsToggleRow', () => {
    it('shouldUseNarrowHorizontalPaddingSoThreeLabelsFitOnOneLine', () => {
        const { getByTestId } = render(
            <SettingsToggleRow options={voiceOptions} value="female" onChange={jest.fn()} testIDPrefix="voice" />
        );

        const button = StyleSheet.flatten(getByTestId('voice-neutral').props.style);
        expect(button.paddingHorizontal).toBe(8);
    });

    it('shouldMarkOnlyTheSelectedOptionAsSelected', () => {
        const { getByTestId, queryByTestId } = render(
            <SettingsToggleRow options={voiceOptions} value="male" onChange={jest.fn()} testIDPrefix="voice" />
        );

        expect(getByTestId('voice-male-selected')).toBeTruthy();
        expect(queryByTestId('voice-female-selected')).toBeNull();
    });

    it('shouldCallOnChangeWithPressedOptionValue', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <SettingsToggleRow options={voiceOptions} value="female" onChange={onChange} testIDPrefix="voice" />
        );

        fireEvent.press(getByTestId('voice-neutral'));

        expect(onChange).toHaveBeenCalledWith('neutral');
    });
});
