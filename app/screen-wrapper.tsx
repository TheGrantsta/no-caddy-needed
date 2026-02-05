import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';

const ScreenWrapper = ({ children }: any) => {
    const colours = useThemeColours();
    const localStyles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            paddingLeft: 10,
            paddingRight: 10,
            backgroundColor: colours.background,
        },
    }), [colours]);

    return <View style={localStyles.container}>{children}</View>;
};

export default ScreenWrapper;
