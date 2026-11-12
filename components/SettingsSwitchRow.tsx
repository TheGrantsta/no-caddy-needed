import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import AppSwitch from './AppSwitch';

type Props = {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    testID: string;
};

// One settings row: a label on the left and an on/off switch on the right
const SettingsSwitchRow = ({ label, value, onValueChange, testID }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.settingsSheet;

    return (
        <View style={s.row}>
            <Text style={s.rowLabel}>{label}</Text>
            <AppSwitch
                testID={testID}
                value={value}
                onValueChange={onValueChange}
                thumbColor={colours.white}
            />
        </View>
    );
};

export default SettingsSwitchRow;
