import React from 'react';
import { Animated, Text, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import ExpandableInfoCard from './ExpandableInfoCard';
import { CHALLENGE_OPTIONS } from '@/utils/quickTools';
import PracticeCard from './PracticeCard';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

export default function PracticeChallengesSection({ fadeAnim, slideAnim }: Props) {
    const styles = useStyles();
    const s = styles.practiceCards;

    const points: string[] = ['Purpose: practise with intent', 'Variety: keep it interesting & challenging', 'Accountability: track progress & measure your performance', 'Pressure: practise under stress'];

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={s.grid}>
                {CHALLENGE_OPTIONS.map(challenge => (
                    <PracticeCard key={challenge.slug} option={challenge} testIDPrefix="challenge" />
                ))}
            </View>

            <View style={s.learnLabelWrap}>
                <Text style={styles.holeScreen.sectionLabel}>Learn</Text>
            </View>
            <ExpandableInfoCard
                icon="menu-book"
                title="Practice principles"
                points={points}
                testIDPrefix="practice-principles"
            />
        </Animated.View>
    );
}
