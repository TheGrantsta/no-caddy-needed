import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    label: string;
    // The control on the right: a switch, a dropdown or similar
    children: ReactNode;
};

// One row in a settings card: the label on the left and its control on the right
const SettingsRow = ({ label, children }: Props) => {
    const styles = useStyles();
    const s = styles.settingsSheet;

    return (
        <View style={s.row}>
            <Text style={s.rowLabel}>{label}</Text>
            {children}
        </View>
    );
};

export default SettingsRow;
