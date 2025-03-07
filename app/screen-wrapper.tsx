import React from 'react';
import { View, StyleSheet } from 'react-native';
import colours from '../assets/colours';

const ScreenWrapper = ({ children }: any) => {
    return <View style={localStyles.container}>{children}</View>;
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: colours.background,
    },
});

export default ScreenWrapper;
