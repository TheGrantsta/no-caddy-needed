import React, { useEffect, useState } from 'react';
import { Text, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

let NetInfo: typeof import('@react-native-community/netinfo').default | null = null;
try {
    NetInfo = require('@react-native-community/netinfo').default;
} catch {
    // NetInfo not available (e.g. Expo Go without native module)
}

export default function NetworkStatus() {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.networkStatus;
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [showBanner, setShowBanner] = useState(false);
    const slideAnim = useState(new Animated.Value(-50))[0];

    useEffect(() => {
        if (!NetInfo) return;

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isConnected === false) {
            setShowBanner(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else if (isConnected === true && showBanner) {
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setShowBanner(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, slideAnim]);

    if (!showBanner) {
        return null;
    }

    return (
        <Animated.View
            style={[
                s.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
            testID="offline-banner"
        >
            <MaterialIcons name="wifi-off" size={18} color={colours.white} />
            <Text style={s.text}>You're offline - data is saved locally</Text>
        </Animated.View>
    );
}
