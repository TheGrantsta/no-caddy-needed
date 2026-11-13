import React from 'react';
import { useThemeColours } from '@/context/ThemeContext';
import AppSwitch from './AppSwitch';
import SettingsRow from './SettingsRow';

type Props = {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    testID: string;
};

// One settings row: a label on the left and an on/off switch on the right
const SettingsSwitchRow = ({ label, value, onValueChange, testID }: Props) => {
    const colours = useThemeColours();

    return (
        <SettingsRow label={label}>
            <AppSwitch
                testID={testID}
                value={value}
                onValueChange={onValueChange}
                thumbColor={colours.white}
            />
        </SettingsRow>
    );
};

export default SettingsSwitchRow;
