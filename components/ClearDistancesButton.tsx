import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

interface Props {
    onPress: () => void;
}

export default function ClearDistancesButton({ onPress }: Props) {
    const colours = useThemeColours();

    return (
        <TouchableOpacity
            testID="clear-button"
            onPress={onPress}
            style={{ padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', columnGap: 8, marginTop: 10 }}
        >
            <MaterialIcons name="delete-sweep" size={20} color={colours.red} />
            <Text style={{ color: colours.red, fontSize: fontSizes.normal }}>Clear all</Text>
        </TouchableOpacity>
    );
}
