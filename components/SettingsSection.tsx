import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    title?: string;
    footnote?: string;
    children: ReactNode;
};

// A titled group of settings rows on a white card, with an optional note underneath
const SettingsSection = ({ title, footnote, children }: Props) => {
    const styles = useStyles();
    const s = styles.settingsSheet;

    return (
        <View>
            {title ? <Text style={s.sectionLabel}>{title}</Text> : null}
            <View testID="settings-section-card" style={s.card}>
                {children}
            </View>
            {footnote ? <Text style={s.footnote}>{footnote}</Text> : null}
        </View>
    );
};

export default SettingsSection;
