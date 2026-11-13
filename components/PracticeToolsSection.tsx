import React from 'react';
import { Animated, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { TOOL_OPTIONS } from '@/utils/quickTools';
import PracticeCard from './PracticeCard';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

// Tool cards share the challenge card layout: a 2×2 grid of tiles with an icon, chevron and label
export default function PracticeToolsSection({ fadeAnim, slideAnim }: Props) {
    const styles = useStyles();
    const s = styles.practiceCards;

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={s.grid}>
                {TOOL_OPTIONS.map(tool => (
                    <PracticeCard key={tool.slug} option={tool} testIDPrefix="tool" />
                ))}
            </View>
        </Animated.View>
    );
}
