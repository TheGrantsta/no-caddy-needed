import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useSectionTransition = (sectionOrder: string[]) => {
    const [section, setSection] = useState(sectionOrder[0]);
    const sectionDirectionRef = useRef<'next' | 'previous'>('next');
    const sectionFadeAnim = useRef(new Animated.Value(0)).current;
    const sectionSlideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const offset = sectionDirectionRef.current === 'next' ? 40 : -40;
        sectionFadeAnim.setValue(0);
        sectionSlideAnim.setValue(offset);
        Animated.parallel([
            Animated.timing(sectionFadeAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.timing(sectionSlideAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
    }, [section, sectionFadeAnim, sectionSlideAnim]);

    const handleSubMenu = (sectionName: string) => {
        const currentIndex = sectionOrder.indexOf(section);
        const nextIndex = sectionOrder.indexOf(sectionName);
        sectionDirectionRef.current = nextIndex > currentIndex ? 'next' : 'previous';
        setSection(sectionName);
    };

    const displaySection = (sectionName: string) => {
        return section === sectionName;
    };

    return {
        section,
        displaySection,
        handleSubMenu,
        fadeAnim: sectionFadeAnim,
        slideAnim: sectionSlideAnim,
    };
};
