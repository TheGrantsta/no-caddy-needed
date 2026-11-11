import React from 'react';
import { Animated, Text, View } from 'react-native';
import { Link, RelativePathString } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import ExpandableInfoCard from './ExpandableInfoCard';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

export default function PracticeChallengesSection({ fadeAnim, slideAnim }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.practiceCards;

    const challenges: { href: RelativePathString; icon: string; label: string }[] = [
        { href: '../challenges/putting-simulation', icon: 'adjust', label: 'Putting sim' },
        { href: '../challenges/up-and-down', icon: 'flag', label: 'Up-and-down' },
        { href: '../challenges/short-putting-ladder', icon: 'stairs', label: 'Short putting' },
        { href: '../challenges/lag-putting', icon: 'trending-up', label: 'Lag putting' },
    ];

    const points: string[] = ['Purpose: practise with intent', 'Variety: keep it interesting & challenging', 'Accountability: track progress & measure your performance', 'Pressure: practise under stress'];

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={s.grid}>
                {challenges.map((challenge) => {
                    const slug = challenge.href.split('/').pop() ?? '';
                    return (
                        <View key={challenge.label} testID={`challenge-slot-${slug}`} style={s.cardSlot}>
                        <Link
                            href={challenge.href}
                            testID={`challenge-link-${slug}`}
                            style={s.cardLink}
                        >
                            <View testID={`challenge-card-${slug}`} style={s.card}>
                                <View style={s.iconTile}>
                                    <MaterialIcons name={challenge.icon as any} size={26} color={colours.primary} />
                                </View>
                                <View testID={`challenge-chevron-${slug}`} style={s.chevron}>
                                    <MaterialIcons name="chevron-right" size={22} color={colours.tertiary} />
                                </View>
                                <Text style={s.cardLabel}>{challenge.label}</Text>
                            </View>
                        </Link>
                        </View>
                    );
                })}
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
