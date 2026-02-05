import { useState, useEffect } from 'react';
import { Dimensions, ViewStyle } from 'react-native';

type OrientationResult = {
    isLandscape: boolean;
    isPortrait: boolean;
    landscapePadding: ViewStyle;
};

export const useOrientation = (): OrientationResult => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription.remove();
    }, []);

    const isLandscape = dimensions.width > dimensions.height;
    const isPortrait = !isLandscape;

    const landscapePadding: ViewStyle = isLandscape
        ? { paddingHorizontal: dimensions.width * 0.1 }
        : {};

    return {
        isLandscape,
        isPortrait,
        landscapePadding,
    };
};
