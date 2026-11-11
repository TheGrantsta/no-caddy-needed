import React, { ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    title: string;
    subtitle?: string;
    // Shows a round back button to the left of the title when given
    onBack?: () => void;
    // Optional control on the right, such as the help button
    rightAction?: ReactNode;
    // Centres the title; an empty side gets a spacer the same width as a control so the title stays in the middle
    centered?: boolean;
};

// The standard screen heading: a large left-aligned title, an optional back button to its left,
// a subtitle underneath, and an optional control on the right
const PageHeader = ({ title, subtitle, onBack, rightAction, centered = false }: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.pageHeader;

    return (
        <View style={s.row}>
            {centered && !onBack ? <View testID="page-header-spacer" style={s.spacer} /> : null}
            {onBack ? (
                <TouchableOpacity
                    testID="page-back-button"
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    onPress={onBack}
                    style={s.circleButton}
                >
                    <MaterialIcons name="chevron-left" size={28} color={colours.black} />
                </TouchableOpacity>
            ) : null}
            <View style={s.titleBlock}>
                <Text style={[s.title, centered && s.titleCentered]}>{title}</Text>
                {subtitle ? <Text style={[s.subtitle, centered && s.titleCentered]}>{subtitle}</Text> : null}
            </View>
            {rightAction ? <View style={s.actionSlot}>{rightAction}</View> : null}
            {centered && !rightAction ? <View testID="page-header-spacer" style={s.spacer} /> : null}
        </View>
    );
};

export default PageHeader;
