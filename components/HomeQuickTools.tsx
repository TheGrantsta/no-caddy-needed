import React from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

const TOOLS = [
    { slug: 'wind', label: 'Wind', icon: 'air', href: '/tools/wind' },
    { slug: 'tempo', label: 'Tempo', icon: 'music-note', href: '/tools/tempo' },
    { slug: 'random', label: 'Random', icon: 'shuffle', href: '/tools/random' },
];

// Three shortcut tiles to the practice tools
export default function HomeQuickTools() {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const s = styles.homeCards;

    return (
        <View>
            <Text style={s.sectionLabel}>QUICK TOOLS</Text>
            <View style={s.toolRow}>
                {TOOLS.map(tool => (
                    <TouchableOpacity
                        key={tool.slug}
                        testID={`home-tool-${tool.slug}`}
                        accessibilityRole="button"
                        onPress={() => router.push(tool.href as any)}
                        style={s.toolTile}
                    >
                        <MaterialIcons name={tool.icon as any} size={26} color={colours.primary} />
                        <Text style={s.toolLabel}>{tool.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
