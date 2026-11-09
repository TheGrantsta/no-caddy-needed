import React, { ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    title: string;
    subtitle?: string;
    onBack: () => void;
    // Optional control shown on the right, e.g. an add button
    rightAction?: ReactNode;
};

// Page title row: round back button on the left, centred title, optional action on the right
const PageHeader = ({ title, subtitle, onBack, rightAction }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.pageHeader;

    return (
        <View style={s.row}>
            <TouchableOpacity
                testID="page-back-button"
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={onBack}
                style={s.circleButton}
            >
                <MaterialIcons name="chevron-left" size={28} color={colours.black} />
            </TouchableOpacity>
            <View style={s.titleBlock}>
                <Text style={s.title}>{title}</Text>
                {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
            </View>
            <View style={s.actionSlot}>{rightAction}</View>
        </View>
    );
};

export default PageHeader;
