import React from 'react';
import { View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

const ScreenWrapper = ({ children }: any) => {
    const styles = useStyles();

    return <View style={styles.screenWrapper.container}>{children}</View>;
};

export default ScreenWrapper;
