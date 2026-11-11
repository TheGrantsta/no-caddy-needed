import React from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { getSettingsService } from '@/service/DbService';
import { DEFAULT_QUICK_TOOLS, QUICK_TOOL_OPTIONS } from '@/utils/quickTools';

// Three shortcut tiles, chosen in Settings from the challenges and tools
export default function HomeQuickTools() {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const s = styles.homeCards;

    // The saved choice is already validated when it is read, so only the default covers a missing value
    const tools = (getSettingsService().quickTools ?? DEFAULT_QUICK_TOOLS)
        .map(slug => QUICK_TOOL_OPTIONS.find(option => option.slug === slug))
        .filter((option): option is NonNullable<typeof option> => option !== undefined);

    return (
        <View>
            <Text style={s.sectionLabel}>QUICK TOOLS</Text>
            <View style={s.toolRow}>
                {tools.map(tool => (
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
