import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

interface Props {
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ClearWedgeChartConfirmation({ onCancel, onConfirm }: Props) {
    const colours = useThemeColours();

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 }}>
            <TouchableOpacity
                testID="cancel-clear-button"
                onPress={onCancel}
                style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: colours.red }}
            >
                <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                testID="confirm-clear-button"
                onPress={onConfirm}
                style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: colours.primary }}
            >
                <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
}
