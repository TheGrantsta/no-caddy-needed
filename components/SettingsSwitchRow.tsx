import React from 'react';
import { Switch, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

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
            <Switch
                testID={testID}
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#E9E9EB', true: colours.primary }}
                thumbColor={colours.white}
            />
        </View>
    );
};

export default SettingsSwitchRow;
