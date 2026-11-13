import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import SettingsRow from '../../components/SettingsRow';

describe('SettingsRow', () => {
    it('shouldShowItsLabelInTheSettingsRowLabelStyle', () => {
        const { getByText } = render(<SettingsRow label="Voice"><Text>Female</Text></SettingsRow>);

        expect(getByText('Voice')).toHaveStyle({ fontSize: require('../../assets/font-sizes').default.normal });
    });

    it('shouldShowTheControlItIsGivenNextToTheLabel', () => {
        const { getByText } = render(<SettingsRow label="Voice"><Text>Female</Text></SettingsRow>);

        expect(getByText('Female')).toBeTruthy();
    });
});
