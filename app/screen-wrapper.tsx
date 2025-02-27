import React from 'react';
import { View, StyleSheet } from 'react-native';
import colours from '../assets/colours';

const ScreenWrapper = ({ children }: any) => {
    return <View style={localStyles.container}>{children}</View>;
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: colours.background,
    },
});

export default ScreenWrapper;
