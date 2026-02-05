import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

let NetInfo: typeof import('@react-native-community/netinfo').default | null = null;
try {
    NetInfo = require('@react-native-community/netinfo').default;
} catch {
    // NetInfo not available (e.g. Expo Go without native module)
}

export default function NetworkStatus() {
    const colours = useThemeColours();
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

    const styles = useMemo(() => StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: colours.backgroundAlternate,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
            zIndex: 1000,
        },
        text: {
            color: colours.white,
            fontSize: fontSizes.small,
            marginLeft: 8,
            fontWeight: '500',
        },
    }), [colours]);

    if (!showBanner) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
            testID="offline-banner"
        >
            <MaterialIcons name="wifi-off" size={18} color={colours.white} />
            <Text style={styles.text}>You're offline - data is saved locally</Text>
        </Animated.View>
    );
}
