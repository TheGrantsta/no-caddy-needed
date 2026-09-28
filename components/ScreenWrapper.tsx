import React from 'react';
import { View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type ScreenWrapperProps = {
    children: React.ReactNode;
};

const ScreenWrapper = ({ children }: ScreenWrapperProps) => {
    const styles = useStyles();

    return <View style={styles.screenWrapper.container}>{children}</View>;
};

export default ScreenWrapper;
